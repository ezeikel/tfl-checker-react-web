"""Transfer a checked Cloudflare build to the matching GitHub release."""

import hashlib
import json
import os
import re
import sys
import tarfile
import time
from pathlib import Path
from urllib import error, request
from urllib.parse import urlencode
from uuid import UUID

env = os.environ
account = env["CLOUDFLARE_ACCOUNT_ID"]
token = env["CLOUDFLARE_API_TOKEN"]
sha = env["GITHUB_SHA"]
branch = env["GITHUB_REF_NAME"]
trigger = "15d58f50-6bc1-4c5a-9897-4c635823ab90"
tag = "238d24a2a5904042a3386a8dc94a3df2"
bucket = "fleet-web-build-handoff"


base = f"accounts/{account}/builds"
build_command = "bash scripts/workers-builds/build.sh"
archive_command = "bash scripts/workers-builds/archive.sh"


def object_key():
    attempt = env.get("BUILD_ATTEMPT", env["GITHUB_RUN_ATTEMPT"])
    return f"releases/tfl-checker-react-web/{sha}/{env['GITHUB_RUN_ID']}-{attempt}.tgz"


def api(path, method="GET", payload=None):
    req = request.Request(
        "https://api.cloudflare.com/client/v4/" + path,
        method=method,
        headers={
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json",
        },
        data=json.dumps(payload).encode() if payload is not None else None,
    )
    for attempt in range(4):
        try:
            with request.urlopen(req, timeout=30) as response:
                data = json.load(response)
            break
        except error.HTTPError as exc:
            if (
                method != "GET"
                or attempt == 3
                or exc.code not in (429, 500, 502, 503, 504)
            ):
                raise
            time.sleep(2**attempt)
    if not data["success"]:
        raise RuntimeError("Cloudflare API rejected " + path)
    return data["result"]


def storage():
    import boto3
    from botocore.config import Config

    token_id = api("user/tokens/verify")["id"]
    return boto3.client(
        "s3",
        region_name="auto",
        endpoint_url=f"https://{account}.r2.cloudflarestorage.com",
        aws_access_key_id=token_id,
        aws_secret_access_key=hashlib.sha256(token.encode()).hexdigest(),
        config=Config(signature_version="s3v4"),
    )


def start():
    configs = api(f"{base}/workers/{tag}/triggers")
    config = next(c for c in configs if c["trigger_uuid"] == trigger)
    if (
        config["branch_includes"] != [branch]
        or config["path_excludes"] != ["*"]
        or config["build_command"] != build_command
        or config["deploy_command"] != archive_command
    ):
        raise RuntimeError("Expected API-only build artifact trigger on this branch")
    url = storage().generate_presigned_url(
        "put_object", Params={"Bucket": bucket, "Key": object_key()}, ExpiresIn=1800
    )
    variables = {
        "RELEASE_UPLOAD_URL": {"value": url, "is_secret": True},
        "RELEASE_SHA": {"value": sha, "is_secret": False},
    }
    for key in ['VITE_TFL_API_URL', 'VITE_TFL_APP_ID', 'VITE_TFL_APP_KEY', 'VITE_GOOGLE_MAPS_API_KEY', 'TFL_BUILD_MODE']:
        variables[key] = {'value': env[key], 'is_secret': False}
    variables['FONTAWESOME_NPM_AUTH_TOKEN'] = {'value': env['FONTAWESOME_NPM_AUTH_TOKEN'], 'is_secret': True}
    api(f"{base}/triggers/{trigger}/environment_variables", "PATCH", variables)
    build = api(
        f"{base}/triggers/{trigger}/builds",
        "POST",
        {"branch": branch, "commit_hash": sha},
    )
    build_id = str(UUID(build["build_uuid"]))
    print("Cloudflare build", build_id, flush=True)
    with open(env["GITHUB_OUTPUT"], "a") as output:
        print("build=" + build_id, file=output)
        print("attempt=" + env["GITHUB_RUN_ATTEMPT"], file=output)


def wait_for_archive(build_id, short=False):
    # Single-CPU GitHub jobs have a 15-minute hard limit. A slow Cloudflare
    # build resumes in the release job with the same build and archive.
    deadline = time.monotonic() + (650 if short else 1500)
    while time.monotonic() < deadline:
        build = api(f"{base}/builds/{build_id}")
        meta = build["build_trigger_metadata"]
        if (
            build["trigger"]["trigger_uuid"] != trigger
            or build["trigger"]["external_script_id"] != tag
            or meta["commit_hash"] != sha
            or meta["branch"] != branch
            or (meta["build_command"], meta["deploy_command"])
            != (build_command, archive_command)
        ):
            raise RuntimeError("Unexpected build metadata")
        if build.get("stopped_on"):
            if build["build_outcome"] != "success":
                raise RuntimeError(
                    "Cloudflare build ended with " + str(build["build_outcome"])
                )
            break
        time.sleep(12)
    else:
        if short:
            print("Build still running; the release job will resume verification.")
            return
        raise RuntimeError("Timed out waiting for Cloudflare")
    path = f"{base}/builds/{build_id}/logs"
    cursor = None
    while True:
        page = api(path + ("?" + urlencode({"cursor": cursor}) if cursor else ""))
        for _, line in page["lines"]:
            match = re.fullmatch(
                r"WEB_RELEASE_ARCHIVE " + sha + r" ([0-9a-f]{64})", line.strip()
            )
            if match:
                with open(env["GITHUB_OUTPUT"], "a") as output:
                    print("digest=" + match[1], file=output)
                return
        if not page.get("cursor") or page["cursor"] == cursor:
            raise RuntimeError("Build did not attest the archive digest")
        cursor = page["cursor"]


def restore():
    dest = Path(env["RUNNER_TEMP"]) / "web-release.tgz"
    storage().download_file(bucket, object_key(), str(dest))
    with dest.open("rb") as stream:
        if hashlib.file_digest(stream, "sha256").hexdigest() != env["RELEASE_DIGEST"]:
            raise RuntimeError("Release archive checksum mismatch")
    with tarfile.open(dest) as archive:
        for entry in archive:
            path = Path(entry.name)
            allowed = path.is_relative_to('dist') or entry.name == '.cloudflare-artifact.json'
            if (
                not allowed
                or ".." in path.parts
                or not (entry.isdir() or entry.isfile())
            ):
                raise RuntimeError("Unexpected release archive member")
            archive.extract(entry, filter="data")
    dest.unlink()


if __name__ == "__main__":
    if sys.argv[1] == "start":
        start()
    elif sys.argv[1] in ("wait", "wait-short"):
        wait_for_archive(
            str(UUID(env["NATIVE_BUILD_ID"])), short=sys.argv[1] == "wait-short"
        )
    elif sys.argv[1] == "restore":
        restore()
    else:
        raise SystemExit("Expected start, wait or restore")
