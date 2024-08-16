import { TUpdateFunction } from './update-function';
export type TUpdateVectorWithCustomState<UpdateFunction> = UpdateFunction extends TUpdateFunction<infer UpdateVectorWithCustomState> ? UpdateVectorWithCustomState : never;
//# sourceMappingURL=update-vector-with-custom-state.d.ts.map