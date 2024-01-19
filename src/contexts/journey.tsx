import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { useSearchParams } from "react-router-dom";
import { Location } from "../../types";

type JourneyContextProviderProps = {
  children: ReactNode;
};

type JourneyContextType = {
  from: Location | null;
  setFrom: Dispatch<SetStateAction<Location | null>>;
  to: Location | null;
  setTo: Dispatch<SetStateAction<Location | null>>;
  reset: () => void;
};

const initialContext: JourneyContextType = {
  from: null,
  setFrom: () => null,
  to: null,
  setTo: () => null,
  reset: () => null,
};

export const JourneyContext = createContext<JourneyContextType>(initialContext);

export const JourneyContextProvider = ({
  children,
}: JourneyContextProviderProps) => {
  const [, setSearchParams] = useSearchParams();
  const [from, setFrom] = useState<Location | null>(initialContext.from);
  const [to, setTo] = useState<Location | null>(initialContext.to);

  const reset = () => {
    setFrom(initialContext.from);
    setTo(initialContext.to);
  };

  const stringifiedFromCoordinates = from
    ? JSON.stringify(from.coordiantes)
    : undefined;
  const stringifiedToCoordinates = to
    ? JSON.stringify(to.coordiantes)
    : undefined;

  useEffect(() => {
    const searchParms: {
      from?: string;
      to?: string;
      fromPlaceId?: string;
      toPlaceId?: string;
    } = {};

    if (stringifiedFromCoordinates) {
      const parsedFromCoordinates = JSON.parse(stringifiedFromCoordinates);
      searchParms.from = `${parsedFromCoordinates.latitude},${parsedFromCoordinates.longitude}`;
    }

    if (stringifiedToCoordinates) {
      const parsedToCoordinates = JSON.parse(stringifiedToCoordinates);
      searchParms.to = `${parsedToCoordinates.latitude},${parsedToCoordinates.longitude}`;
    }

    if (from?.placeId) {
      searchParms.fromPlaceId = from.placeId;
    }

    if (to?.placeId) {
      searchParms.toPlaceId = to.placeId;
    }

    // update the url
    setSearchParams(searchParms);
  }, [
    stringifiedFromCoordinates,
    from?.placeId,
    stringifiedToCoordinates,
    to?.placeId,
  ]);

  return (
    <JourneyContext.Provider
      value={{
        from,
        setFrom,
        to,
        setTo,
        reset,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourneyContext = () => {
  const context = useContext(JourneyContext);
  if (context === undefined) {
    throw new Error(
      "useJourneyContext must be used within a JourneyContextProvider",
    );
  }

  return context;
};
