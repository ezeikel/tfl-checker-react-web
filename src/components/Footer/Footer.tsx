import { Link } from "react-router-dom";
import {
  Wrapper,
  Logo,
  Versions,
  ThisVersion,
  OtherVersions,
  Designs,
  Copyright,
} from "./Footer.styled";

const Footer = () => (
  <Wrapper>
    <Logo>
      <Link to="/">TfL Checker</Link>
    </Logo>
    <Versions>
      <ThisVersion>
        <span>This website was built using</span>
        <span>React</span>
      </ThisVersion>
      <OtherVersions>
        <span>It has also been built using</span>
        <ul>
          <li>
            <a href="/">Vanilla JavaScript (no framework)</a>
          </li>
          <li>
            <a href="/">Angular</a>
          </li>
          <li>
            <a href="/">Vue</a>
          </li>
          <li>
            <a href="/">Svelte</a>
          </li>
          <li>
            <a href="/">AnguarJS</a>
          </li>
          <li>
            <a href="/">BackboneJS</a>
          </li>
        </ul>
      </OtherVersions>
      <Designs>
        <span>It was designed using Adobe XD</span>
        <ul>
          <li>
            <a href="https://adobeid-na1.services.adobe.com/ims/jump/eyJraWQiOiJLMjAxNiIsImFsZyI6IlJTMjU2In0.eyJqdGkiOiIxNTg3OTI0OTAwNjI5Xzg2NjhiMTlkLTJkOWItNDlmMi1hOTdiLWRiOGFjY2E0OGU0Yl9ldzEiLCJjaWQiOiJDb21ldFdlYjEiLCJ1aWQiOiIxNjQ5NDFDMzUzNjE4NzY5MEE0OTBENDVAQWRvYmVJRCIsInJ1IjoiaHR0cHM6Ly94ZC5hZG9iZS5jb20vdmlldy9jZWNjYWFkYi0xMTEwLTRmYmQtNDM2Mi1hMmUwYWVhZDRiMjMtYjhmZC8iLCJydCI6InRva2VuIiwiY2UiOiJBZllKMGx1TmEwajdoR01WRURXOW8xT3phX09iTGhWUS1GSWpWWkF3X2NHYUpMTlczM2ltTnM0X1B6akdlWDV4cnV2OVBJWFY5QnU4N3MxMEVfZ05fSnFUZUZoSHdmb3JXbkVIb1JweXZMbHRTdyIsImV4cCI6MTU4NzkyNTgwMDYyOSwicmYiOiJVTUk0UTU1NVhMTzU3NzYyQzZZTFFQUUFWTT09PT09PSIsImlzcyI6Imh0dHBzOi8vaW1zLW5hMS5hZG9iZWxvZ2luLmNvbSJ9.SHeNeRECKMMnzi_3C60OFOe6lWAOOdtS1kdeiWFDf5E_Q4M9GaFmyRA6WoGzwHLExrmY1JXdEx4AuBw_Cr5CAnGkC_uz6xIYL_fDVD4u-fKUWIbaC9APSLfnjuMM508XgW092JGL8on_sceE_nkypw5178fIdflrZGq1Z0gOhsLao5eni6CeI2VtksZn2KBvc2BTi_JGR_F9rq-z5gk1IY7dMT5lyakdA2uw1w6SMWNH2EO7N42YRco44Z1Q-kh2tjn0j5ighwJ4rZjyo3HkOElIpdUdJ9Cnzq4p8BAHJv9gy4DPct29uhBdQnXi8vvJBURd1J3JTK0MXB_TG3KLcA">
              Desktop Prototype
            </a>
          </li>
          <li>
            <a href="https://adobeid-na1.services.adobe.com/ims/jump/eyJraWQiOiJLMjAxNiIsImFsZyI6IlJTMjU2In0.eyJqdGkiOiIxNTg3OTI0OTAwNjI5Xzg2NjhiMTlkLTJkOWItNDlmMi1hOTdiLWRiOGFjY2E0OGU0Yl9ldzEiLCJjaWQiOiJDb21ldFdlYjEiLCJ1aWQiOiIxNjQ5NDFDMzUzNjE4NzY5MEE0OTBENDVAQWRvYmVJRCIsInJ1IjoiaHR0cHM6Ly94ZC5hZG9iZS5jb20vdmlldy9jZWNjYWFkYi0xMTEwLTRmYmQtNDM2Mi1hMmUwYWVhZDRiMjMtYjhmZC8iLCJydCI6InRva2VuIiwiY2UiOiJBZllKMGx1TmEwajdoR01WRURXOW8xT3phX09iTGhWUS1GSWpWWkF3X2NHYUpMTlczM2ltTnM0X1B6akdlWDV4cnV2OVBJWFY5QnU4N3MxMEVfZ05fSnFUZUZoSHdmb3JXbkVIb1JweXZMbHRTdyIsImV4cCI6MTU4NzkyNTgwMDYyOSwicmYiOiJVTUk0UTU1NVhMTzU3NzYyQzZZTFFQUUFWTT09PT09PSIsImlzcyI6Imh0dHBzOi8vaW1zLW5hMS5hZG9iZWxvZ2luLmNvbSJ9.SHeNeRECKMMnzi_3C60OFOe6lWAOOdtS1kdeiWFDf5E_Q4M9GaFmyRA6WoGzwHLExrmY1JXdEx4AuBw_Cr5CAnGkC_uz6xIYL_fDVD4u-fKUWIbaC9APSLfnjuMM508XgW092JGL8on_sceE_nkypw5178fIdflrZGq1Z0gOhsLao5eni6CeI2VtksZn2KBvc2BTi_JGR_F9rq-z5gk1IY7dMT5lyakdA2uw1w6SMWNH2EO7N42YRco44Z1Q-kh2tjn0j5ighwJ4rZjyo3HkOElIpdUdJ9Cnzq4p8BAHJv9gy4DPct29uhBdQnXi8vvJBURd1J3JTK0MXB_TG3KLcA">
              Mobile Prototype
            </a>
          </li>
        </ul>
      </Designs>
    </Versions>
    <Copyright>
      <div>&copy; TfL Checker. All rights reserved.</div>
      <div>
        Made with <span>♡</span> in <span>South London</span>
      </div>
    </Copyright>
  </Wrapper>
);

export default Footer;
