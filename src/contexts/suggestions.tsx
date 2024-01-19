import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { Journey } from "../../types";

type SuggestionsContextProviderProps = {
  children: ReactNode;
};

type SuggestionContextType = {
  selectedJourney?: Journey;
  setSelectedJourney: Dispatch<SetStateAction<Journey | undefined>>;
  clearSelectedJourney: () => void;
};

const initialContext: SuggestionContextType = {
  selectedJourney: undefined,
  setSelectedJourney: () => null,
  clearSelectedJourney: () => null,
};

export const SuggestionsContext =
  createContext<SuggestionContextType>(initialContext);

export const SuggestionsContextProvider = ({
  children,
}: SuggestionsContextProviderProps) => {
  const [selectedJourney, setSelectedJourney] = useState<Journey>();

  // TODO: move to journey context and rename to clearSelectedJourney
  const clearSelectedJourney = () =>
    setSelectedJourney(initialContext.selectedJourney);

  return (
    <SuggestionsContext.Provider
      value={{
        selectedJourney, // TODO: move to journey context and rename to selectedJourney
        setSelectedJourney, // TODO: move to journey context and rename to setSelectedJourney
        clearSelectedJourney, // TODO: move to journey context and rename to clearSelectedJourney
      }}
    >
      {children}
    </SuggestionsContext.Provider>
  );
};

export const useSuggestionsContext = () => {
  const context = useContext(SuggestionsContext);
  if (context === undefined) {
    throw new Error(
      "useSuggestionsContext must be used within a SuggestionsContextProvider",
    );
  }

  return context;
};
