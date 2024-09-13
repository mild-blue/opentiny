import { AlloySpec, Behaviour, GuiFactory, Keying, Replacing, SimpleSpec, Tooltipping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Optional } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import * as Icons from '../icons/Icons';

type LabelSpec = Omit<Dialog.Label, 'type'>;

export const renderLabel = (spec: LabelSpec, backstageShared: UiFactoryBackstageShared): SimpleSpec => {
  const baseClass = 'tox-label';
  const centerClass = spec.align === 'center' ? [ `${baseClass}--center` ] : [];
  const endClass = spec.align === 'end' ? [ `${baseClass}--end` ] : [];

  const label: AlloySpec = {
    dom: {
      tag: 'label',
      classes: [ baseClass, ...centerClass, ...endClass ]
    },
    components: [
      GuiFactory.text(backstageShared.providers.translate(spec.label))
    ]
  };

  if (!spec.tooltip || spec.tooltip.getOr('') === '') {
    return label;
  }

  const makeIcon = (iconName: string) =>
    Icons.render(iconName, { tag: 'span', classes: [ 'tox-icon', 'tox-label-tooltip-icon' ] }, backstageShared.providers.icons);

  const labelTooltip = {
    dom: {
      tag: 'div',
      classes: [ 'tox-label-tooltip' ]
    },
    components: [
      makeIcon('tooltip')
    ],
    behaviours: Behaviour.derive([
      Tooltipping.config(
        backstageShared.providers.tooltips.getConfig({
          tooltipText: backstageShared.providers.translate(spec.tooltip.getOr('')),
        })
      ),
    ])
  };

  const labelContainer = {
    dom: {
      tag: 'div',
      classes: [ 'tox-form__label-container' ]
    },
    components: [
      label,
      labelTooltip
    ]
  };

  const comps = Arr.map(spec.items, backstageShared.interpreter);
  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: [
      labelContainer,
      ...comps
    ],
    behaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Replacing.config({}),
      RepresentingConfigs.domHtml(Optional.none()),
      Keying.config({
        mode: 'acyclic'
      })
    ])
  };
};
