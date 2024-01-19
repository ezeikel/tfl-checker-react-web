import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  FormWrapper,
  InputWrapper,
  StartEnd,
  VerticalLine,
} from "./JourneyPlannerForm.styled";
import { faCircle } from "@fortawesome/pro-duotone-svg-icons";
import PlacesAutoCompleteInput from "../inputs/PlacesAutoCompleteInput/PlacesAutoCompleteInput";
import { useJourneyContext } from "../../../contexts/journey";
import {
  geocodeByAddress,
  geocodeByPlaceId,
  getLatLng,
} from "react-places-autocomplete";
import { useSearchParams } from "react-router-dom";

const JourneyPlannerForm = () => {
  const { setFrom, setTo } = useJourneyContext();
  const [toAddress, setToAddress] = useState<string | null>(null);
  const [fromAddress, setFromAddress] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  const handleFromSelect = async (address: string, placeId: string) => {
    const [results] = await geocodeByAddress(address);
    const latLng = await getLatLng(results);

    setFromAddress(address);

    setFrom({
      coordiantes: {
        latitude: latLng.lat,
        longitude: latLng.lng,
      },
      placeId,
    });
  };

  const handleToSelect = async (address: string, placeId: string) => {
    const [results] = await geocodeByAddress(address);
    const latLng = await getLatLng(results);

    setToAddress(address);

    setTo({
      coordiantes: {
        latitude: latLng.lat,
        longitude: latLng.lng,
      },
      placeId,
    });
  };

  // handle setting initial address on page load if there coordinates in the url
  useEffect(() => {
    if (
      searchParams.get("from") &&
      !fromAddress &&
      searchParams.get("fromPlaceId")
    ) {
      // clear the state and url if user has deleted the from address
      if (fromAddress === "") {
        setFrom(null);
        return;
      }

      geocodeByPlaceId(searchParams.get("fromPlaceId") as string).then(
        (results) => {
          setFromAddress(results[0].formatted_address);
        },
      );
    }

    if (searchParams.get("to") && !toAddress && searchParams.get("toPlaceId")) {
      // clear the state and url if user has deleted the from address
      if (toAddress === "") {
        setTo(null);
        return;
      }

      geocodeByPlaceId(searchParams.get("toPlaceId") as string).then(
        (results) => {
          setToAddress(results[0].formatted_address);
        },
      );
    }
  }, [
    searchParams.get("from"),
    fromAddress,
    searchParams.get("fromPlaceId"),
    searchParams.get("to"),
    toAddress,
    searchParams.get("toPlaceId"),
  ]);

  return (
    <FormWrapper>
      <StartEnd>
        <FontAwesomeIcon icon={faCircle} color="var(--color-green)" size="2x" />
        <VerticalLine />
        <FontAwesomeIcon
          icon={faCircle}
          color="var(--color-background)"
          size="2x"
        />
      </StartEnd>
      <form>
        <InputWrapper>
          <label htmlFor="fromAddress">From</label>
          <PlacesAutoCompleteInput
            id="start"
            value={fromAddress || ""}
            placeholder="Where are you coming from?"
            handleSelect={handleFromSelect}
            handleChange={setFromAddress}
          />
        </InputWrapper>
        <hr />
        <InputWrapper>
          <label htmlFor="toAddress">To</label>
          <PlacesAutoCompleteInput
            id="end"
            value={toAddress || ""}
            placeholder="Where are you going to?"
            handleSelect={handleToSelect}
            handleChange={setToAddress}
          />
        </InputWrapper>
      </form>
    </FormWrapper>
  );
};

export default JourneyPlannerForm;
