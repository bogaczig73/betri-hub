/**
 * Lactate-threshold calculation engine. Pure, framework-free; safe to import on
 * the server or the client. See the spec and `lactater` reference for methods.
 */

export { analyze, LactateInputError, type AnalyzeOutput } from "./analyze";
export type {
  AnalyzeOptions,
  Estimates,
  Fitting,
  MethodCategory,
  PolyDegree,
  Result,
  Stage,
} from "./types";
export {
  paceToSpeed,
  speedToPace,
  speedToIntensityStages,
} from "./intensity";
