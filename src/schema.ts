
export interface BaseParamSchema<T> {
    id: string;
    label: string;
    type: string;
    value: T;
    default?: T;
    showIf?: (params: FixtureParameters) => boolean;
}

export interface RangeParamSchema extends BaseParamSchema<number> {
    type: 'range';
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

export interface CheckboxParamSchema extends BaseParamSchema<boolean> {
    type: 'checkbox';
}

export type ParamSchema = RangeParamSchema | CheckboxParamSchema;

export abstract class FixtureParameters {
    styleId: string;
    displayStyleName: string;
    params: Map<string, ParamSchema>;

    constructor(styleId: string, displayStyleName: string) {
        this.styleId = styleId;
        this.displayStyleName = displayStyleName;
        this.params = new Map<string, ParamSchema>();
    }

    add(param: ParamSchema): FixtureParameters {
        this.params.set(param.id, param);
        return this;
    }

    get(id: string): ParamSchema | undefined {
        return this.params.get(id);
    }

    abstract generateFilename(): string;
}