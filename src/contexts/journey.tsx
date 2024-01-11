import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
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
  const [from, setFrom] = useState<Location | null>(initialContext.from);
  const [to, setTo] = useState<Location | null>(initialContext.to);

  const reset = () => {
    setFrom(initialContext.from);
    setTo(initialContext.to);
  };

  return (
    <JourneyContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
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
