import { useCallback, useState } from "react";

import { sendMoney } from "../services/transferService";
import { SendMoneyParams, TransferError } from "../types/index";

interface SendMoneyState {
  loading: boolean;
  error: TransferError | null;
  success: boolean;
}

interface UseSendMoneyResult extends SendMoneyState {
  execute: (params: SendMoneyParams) => Promise<boolean>;
  reset: () => void;
}

export function useSendMoney(): UseSendMoneyResult {
  const [state, setState] = useState<SendMoneyState>({
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(async (params: SendMoneyParams): Promise<boolean> => {
    setState({ loading: true, error: null, success: false });

    const result = await sendMoney(params);

    if (result.success) {
      setState({ loading: false, error: null, success: true });
      return true;
    } else {
      setState({ loading: false, error: result.error, success: false });
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return { ...state, execute, reset };
}
