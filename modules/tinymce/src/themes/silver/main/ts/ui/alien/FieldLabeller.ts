import { AlloySpec, Behaviour, FormField as AlloyFormField, GuiFactory, RawDomSchema, SketchSpec, Tooltipping } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as Icons from '../icons/Icons';

type FormFieldSpec = Parameters<typeof AlloyFormField['sketch']>[0];

const renderFormFieldWith = (pLabel: Optional<AlloySpec>, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]): SketchSpec => {
  const spec = renderFormFieldSpecWith(pLabel, pField, extraClasses, extraBehaviours);
  return AlloyFormField.sketch(spec);
};

const renderFormField = (pLabel: Optional<AlloySpec>, pField: AlloySpec): SketchSpec =>
  renderFormFieldWith(pLabel, pField, [ ], [ ]);

const renderFormFieldSpec = (pLabel: Optional<AlloySpec>, pField: AlloySpec): FormFieldSpec => ({
  dom: renderFormFieldDom(),
  components: pLabel.toArray().concat([ pField ])
});

const renderFormFieldSpecWith = (
  pLabel: Optional<AlloySpec>,
  pField: AlloySpec,
  extraClasses: string[],
  extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]
): FormFieldSpec => ({
  dom: renderFormFieldDomWith(extraClasses),
  components: pLabel.toArray().concat([ pField ]),
  fieldBehaviours: Behaviour.derive(extraBehaviours)
});

const renderFormFieldDom = (): RawDomSchema => renderFormFieldDomWith([ ]);

const renderFormFieldDomWith = (extraClasses: string[]): RawDomSchema => ({
  tag: 'div',
  classes: [ 'tox-form__group' ].concat(extraClasses)
});

const renderLabel = (label: string, tooltip: string, providersBackstage: UiFactoryBackstageProviders): AlloySpec => {
  const labelElement = {
    dom: {
      tag: 'label',
      classes: [ 'tox-label' ]
    },
    components: [
      GuiFactory.text(providersBackstage.translate(label))
    ]
  };

  if (tooltip.trim() === '') {
    return AlloyFormField.parts.label(labelElement);
  }

  const makeIcon = (iconName: string) =>
    Icons.render(iconName, { tag: 'span', classes: [ 'tox-icon', 'tox-label-tooltip-icon' ] }, providersBackstage.icons);

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
        providersBackstage.tooltips.getConfig({
          tooltipText: providersBackstage.translate(tooltip),
        })
      ),
    ])
  };

  return AlloyFormField.parts.label({
    dom: {
      tag: 'div',
      classes: [ 'tox-form__label-container' ]
    },
    components: [
      labelElement,
      labelTooltip
    ]
  });
};

export {
  renderFormField,
  renderFormFieldWith,
  renderFormFieldSpec,
  renderFormFieldDom,
  renderLabel
};
