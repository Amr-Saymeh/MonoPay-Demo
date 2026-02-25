import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type SignupDetails = {
  firstName: string;
  lastName: string;
  email: string;
  pin: string;
  phone: string;
  address: string;
  identityNumber: string;
};

type SignupFlowContextValue = {
  details: SignupDetails | null;
  identityImageUri: string | null;
  personalImageUri: string | null;
  setDetails: (details: SignupDetails) => void;
  setIdentityImageUri: (uri: string) => void;
  setPersonalImageUri: (uri: string) => void;
  clear: () => void;
};

const SignupFlowContext = createContext<SignupFlowContextValue | null>(null);

export function SignupFlowProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [details, setDetailsState] = useState<SignupDetails | null>(null);
  const [identityImageUri, setIdentityImageUriState] = useState<string | null>(
    null,
  );
  const [personalImageUri, setPersonalImageUriState] = useState<string | null>(
    null,
  );

  const setDetails = useCallback((v: SignupDetails) => {
    setDetailsState(v);
  }, []);

  const setIdentityImageUri = useCallback((uri: string) => {
    setIdentityImageUriState(uri);
  }, []);

  const setPersonalImageUri = useCallback((uri: string) => {
    setPersonalImageUriState(uri);
  }, []);

  const clear = useCallback(() => {
    setDetailsState(null);
    setIdentityImageUriState(null);
    setPersonalImageUriState(null);
  }, []);

  const value = useMemo<SignupFlowContextValue>(
    () => ({
      details,
      identityImageUri,
      personalImageUri,
      setDetails,
      setIdentityImageUri,
      setPersonalImageUri,
      clear,
    }),
    [
      details,
      identityImageUri,
      personalImageUri,
      setDetails,
      setIdentityImageUri,
      setPersonalImageUri,
      clear,
    ],
  );

  return (
    <SignupFlowContext.Provider value={value}>
      {children}
    </SignupFlowContext.Provider>
  );
}

export function useSignupFlow() {
  const ctx = useContext(SignupFlowContext);
  if (!ctx)
    throw new Error("useSignupFlow must be used within SignupFlowProvider");
  return ctx;
}
