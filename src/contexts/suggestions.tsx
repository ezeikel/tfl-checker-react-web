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
  fetchingSuggestions: boolean;
  setFetchingSuggestions: Dispatch<SetStateAction<boolean>>;
  results?: Journey[];
  setResults: Dispatch<SetStateAction<Journey[] | undefined>>;
  selectedTrip?: Journey;
  setSelectedTrip: Dispatch<SetStateAction<Journey | undefined>>;
  reset: () => void;
  clearSelectedTrip: () => void;
};

const initialContext: SuggestionContextType = {
  fetchingSuggestions: false,
  setFetchingSuggestions: () => null,
  results: undefined,
  setResults: () => null,
  selectedTrip: undefined,
  setSelectedTrip: () => null,
  reset: () => null,
  clearSelectedTrip: () => null,
};

export const SuggestionsContext =
  createContext<SuggestionContextType>(initialContext);

export const SuggestionsContextProvider = ({
  children,
}: SuggestionsContextProviderProps) => {
  const [fetchingSuggestions, setFetchingSuggestions] =
    useState<boolean>(false);
  const [results, setResults] = useState<Journey[]>();
  const [selectedTrip, setSelectedTrip] = useState<Journey>();

  const reset = () => {
    setFetchingSuggestions(initialContext.fetchingSuggestions);
    setResults(initialContext.results);
    setSelectedTrip(initialContext.selectedTrip);
  };

  const clearSelectedTrip = () => setSelectedTrip(initialContext.selectedTrip);

  return (
    <SuggestionsContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        fetchingSuggestions,
        setFetchingSuggestions,
        results,
        setResults,
        selectedTrip,
        setSelectedTrip,
        reset,
        clearSelectedTrip,
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
