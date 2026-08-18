import { useCallback, useRef, useState } from "react";
import { engineNotConnectedMessage, fetchNatalChart } from "../api/astrology.service";
import type {
  AstrologyRequest,
  EngineStatus,
  NatalChartResponse,
  RitualStage,
} from "../model/types";
import { useLanguage } from "@/hooks/useLanguage";

interface RitualState {
  stage: RitualStage;
  request: AstrologyRequest | null;
  engineStatus: EngineStatus;
  engineMessage: string;
  result: NatalChartResponse | null;
  begin: () => void;
  submit: (input: AstrologyRequest) => void;
  completeSequence: () => void;
  restart: () => void;
}

/**
 * Stan przepływu rytuału: wprowadzenie → formularz → sekwencja → ekran wyniku.
 * Zapytanie do backendu startuje razem z sekwencją; ekran końcowy pokazuje się
 * dopiero po jej zakończeniu.
 */
export function useAstrologyRitual(): RitualState {
  const { t } = useLanguage();
  const [stage, setStage] = useState<RitualStage>("intro");
  const [request, setRequest] = useState<AstrologyRequest | null>(null);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("not-connected");
  const [engineMessage, setEngineMessage] = useState<string>(engineNotConnectedMessage());
  const [result, setResult] = useState<NatalChartResponse | null>(null);
  const pending = useRef<Promise<void> | null>(null);

  const begin = useCallback(() => setStage("form"), []);

  const submit = useCallback(
    (input: AstrologyRequest) => {
      setRequest(input);
      setResult(null);
      setEngineStatus("not-connected");
      setEngineMessage(engineNotConnectedMessage());
      setStage("processing");

      pending.current = fetchNatalChart(input).then((response) => {
        if (response.ok && response.data) {
          setResult(response.data);
          setEngineStatus("ready");
          setEngineMessage(t("astrology.ritual.outcome.readyMessage"));
          return;
        }
        const notConnected = engineNotConnectedMessage();
        const message = (!response.ok && response.error) || notConnected;
        setEngineStatus(message === notConnected ? "not-connected" : "error");
        setEngineMessage(message);
      });
    },
    [t],
  );

  const completeSequence = useCallback(() => {
    const finish = () => setStage("outcome");
    if (pending.current) {
      void pending.current.then(finish);
      return;
    }
    finish();
  }, []);

  const restart = useCallback(() => {
    pending.current = null;
    setRequest(null);
    setResult(null);
    setEngineStatus("not-connected");
    setEngineMessage(engineNotConnectedMessage());
    setStage("form");
  }, []);

  return {
    stage,
    request,
    engineStatus,
    engineMessage,
    result,
    begin,
    submit,
    completeSequence,
    restart,
  };
}
