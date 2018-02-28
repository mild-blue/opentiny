import { ApproxStructure, Assertions, FocusTools, Guard, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Focusing from 'ephox/alloy/api/behaviour/Focusing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import GuiSetup from 'ephox/alloy/test/GuiSetup';

UnitTest.asynctest('FocusingTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  GuiSetup.setup(function (store, doc, body) {
    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'focusable' ],
          styles: {
            width: '100px',
            height: '100px',
            background: 'blue'
          }
        },
        containerBehaviours: Behaviour.derive([
          Focusing.config({
            onFocus: store.adder('onFocus')
          })
        ])
      })
    );
  }, function (doc, body, gui, component, store) {
    return [
      Assertions.sAssertStructure(
        'Checking tabindex is -1',
        ApproxStructure.build(function (s, str, arr) {
          return s.element('div', {
            attrs: {
              tabindex: str.is('-1')
            }
          });
        }),
        component.element()
      ),

      Step.control(
        FocusTools.sIsOnSelector('Should not start with focus', doc, '.focusable'),
        // NOTE: this required a change to agar because it was throwing an error prototype,
        // rather than die for its assertion, which meant that the tryUntilNot did not work.
        // I had to hack the local agar to ignore the error prototype check in Guard. Will
        // need to fix this.
        Guard.tryUntilNot('Container should not be focused originally', 100, 1000)
      ),
      Step.sync(function () {
        component.getSystem().triggerFocus(component.element(), gui.element());
      }),
      FocusTools.sTryOnSelector('Focusing after focus call', doc, '.focusable')

    ];
  }, function () { success(); }, failure);
});
