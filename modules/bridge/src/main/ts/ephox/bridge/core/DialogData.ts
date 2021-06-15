import { FieldSchema, StructureProcessor, StructureSchema } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { DialogSpec } from '../components/dialog/Dialog';
import { getDataProcessor, getNamedItems } from './DataProcessors';

export const createDataValidator = <T>(structure: DialogSpec<T>): StructureProcessor => {
  const namedItems = getNamedItems(structure);
  const fields = Arr.bind(namedItems, (item) => getDataProcessor(item).fold(
    () => [],
    (schema) => [ FieldSchema.requiredOf(item.name, schema) ]
  ));

  return StructureSchema.objOf(fields);
};
