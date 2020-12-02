import type { TConfig, TCss, TCssProperties, TMainBreakPoint } from './stitches_types.ts';
import { React } from './react.ts';

export * from '@stitches/react';

export declare type TCssProp<T extends TConfig> = TCssProperties<T> | (string & {});
/**
 * Extracts Variants from an object:
 */
export declare type TExtractVariants<Styles> = Styles extends {
  variants: infer Variants;
}
  ? {
      [a in keyof Variants]: keyof Variants[a];
    }
  : {};
/**
 * Extracts Breakpoint keys from a config
 */
export declare type BreakPointsKeys<Config extends TConfig> = keyof Config['breakpoints'];
/**
 * Takes a value and if it's one of the string type representations of a boolean ('true' | 'false')
 * it adds the actual boolean values to it
 */
export declare type CastStringToBoolean<Val> = Val extends 'true' | 'false'
  ? boolean | 'true' | 'false'
  : never;
/**
 * adds the string type to number while also preserving autocomplete for other string values
 */
export declare type CastNumberToString<Val> = Val extends number ? string & {} : never;
/**
 * Extract variant props from a Stitches component
 */
export declare type StitchesVariants<C> = C extends IStyledComponent<
  infer T,
  infer V,
  infer G
>
  ? VariantASProps<G, V>
  : never;
/**
 * Extracts the props from a Stitches component
 *
 */
export declare type StitchesProps<C> = C extends IStyledComponent<
  infer T,
  infer V,
  infer G
>
  ? MergeElementProps<T, VariantASProps<G, V>> & {
      as?: T;
      css?: TCssWithBreakpoints<G>;
      className?: string;
      children?: any;
    }
  : never;
/**
 * Takes a variants object and converts it to the correct type information for usage in props
 */
export declare type VariantASProps<Config extends TConfig, VariantsObj> = {
  [V in keyof VariantsObj]?:
    | CastStringToBoolean<VariantsObj[V]>
    | VariantsObj[V]
    | CastNumberToString<VariantsObj[V]>
    | {
        [B in BreakPointsKeys<Config> | TMainBreakPoint]?:
          | CastStringToBoolean<VariantsObj[V]>
          | VariantsObj[V]
          | CastNumberToString<VariantsObj[V]>;
      };
};
declare type MergeElementProps<
  As extends React.ElementType,
  Props extends object = {}
> = Omit<React.ComponentPropsWithRef<As>, keyof Props> & Props;
/**
 * Types for a styled component which contain:
 * 1. Props of a styled component
 * 2. The compoundVariants function typings
 */
export interface IStyledComponent<
  ComponentOrTag extends React.ElementType,
  Variants,
  Config extends TConfig
>
  extends React.FC<
    MergeElementProps<ComponentOrTag, VariantASProps<Config, Variants>> & {
      css?: TCssWithBreakpoints<Config>;
      className?: string;
      children?: any;
    }
  > {
  /**
   * Props of a styled component
   */
  (
    props: MergeElementProps<ComponentOrTag, VariantASProps<Config, Variants>> & {
      as?: never;
      css?: TCssWithBreakpoints<Config>;
      className?: string;
      children?: any;
    },
  ): any;
  <As extends React.ElementType = ComponentOrTag>(
    props: MergeElementProps<As, VariantASProps<Config, Variants>> & {
      as: As;
      css?: TCssWithBreakpoints<Config>;
      className?: string;
      children?: any;
    },
  ): any;
  /**
   * Compound Variant typing:
   */
  compoundVariant: (
    compoundVariants: VariantASProps<Config, Variants>,
    possibleValues: TCssWithBreakpoints<Config>,
  ) => IStyledComponent<ComponentOrTag, Variants, Config>;
  /**
   * @deprecated
   */
  defaultProps?: never;
}
/** Typed css with tokens and breakpoints */
export declare type TCssWithBreakpoints<Config extends TConfig> = TCssProp<Config> &
  {
    [key in BreakPointsKeys<Config>]?: TCssProp<Config>;
  };
/** The type for the styles in a styled call */
export declare type TComponentStylesObject<Config extends TConfig> = TCssWithBreakpoints<
  Config
> & {
  variants?: {
    [k: string]: {
      [s: string]: TCssWithBreakpoints<Config>;
    };
  };
};
/**
 * Types for styled.button, styled.div, etc..
 */
export declare type TProxyStyledElements<Config extends TConfig> = {
  [key in keyof JSX.IntrinsicElements]: <
    BaseAndVariantStyles extends TComponentStylesObject<Config>
  >(
    a: BaseAndVariantStyles | TComponentStylesObject<Config>,
  ) => IStyledComponent<key, TExtractVariants<BaseAndVariantStyles>, Config>;
};
/**
 * Styled Components creator Type.
 * ie: styled.div(styles) | styled('div', {styles})
 */
export declare type TStyled<Config extends TConfig> = {
  <
    TagOrComponent extends
      | keyof JSX.IntrinsicElements
      | React.ComponentType<any>
      | IStyledComponent<any, any, Config>,
    BaseAndVariantStyles extends TComponentStylesObject<Config>,
    Variants = TExtractVariants<BaseAndVariantStyles>
  >(
    tag: TagOrComponent,
    baseStyles: BaseAndVariantStyles | TComponentStylesObject<Config>,
  ): TagOrComponent extends IStyledComponent<infer T, infer V, Config>
    ? IStyledComponent<T, Omit<V, keyof Variants> & Variants, Config>
    : IStyledComponent<TagOrComponent, Variants, Config>;
} & TProxyStyledElements<Config>;
export declare const createStyled: <Config extends TConfig<false>>(
  config: Config,
) => {
  css: TCss<Config>;
  styled: TStyled<Config>;
};
