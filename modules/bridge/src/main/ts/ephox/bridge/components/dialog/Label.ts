import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';
import { Optional } from '@ephox/katamari';

type Alignment = 'start' | 'center' | 'end';

export interface LabelSpec {
  type: 'label';
  name?: string;
  label: string;
  items: BodyComponentSpec[];
  align?: Alignment;
  tooltip?: string;
}

export interface Label {
  type: 'label';
  label: string;
  items: BodyComponent[];
  align: Alignment;
  tooltip: Optional<string>;
}

export const createLabelFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  ComponentSchema.type,
  ComponentSchema.label,
  itemsField,
  FieldSchema.defaultedStringEnum('align', 'start', [ 'start', 'center', 'end' ]),
  ComponentSchema.optionalTooltip
];
