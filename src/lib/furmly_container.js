import React from "react";
import invariants from "./utils/invariants";
import withLogger from "./furmly_base";

export default (...args) => {
  //invariants
  let Section = args[0],
    Header = args[1],
    ComponentWrapper,
    componentLocator;
  if (args.length == 3) {
    componentLocator = args[2];
  } else {
    ComponentWrapper = args[2];
    componentLocator = args[3];
  }

  if (
    invariants.validComponent(Section, "Section") &&
    invariants.validComponent(Header, "Header") &&
    !componentLocator
  )
    throw new Error("componentLocator cannot be null (furmly_container)");

  class FurmlyContainer extends React.PureComponent {
    constructor(props) {
      super(props);
      this.onValueChanged = this.onValueChanged.bind(this);
      this.onDisplayValueChanged = this.onDisplayValueChanged.bind(this);
      this.state = {
        _validations: (this.props.elements || []).map(x => ({}))
      };
      this.setValidator = this.setValidator.bind(this);
      this.setValidator();
    }
    componentWillReceiveProps(next) {
      if (
        next.elements &&
        (next.elements !== this.props.elements ||
          next.elements.length !== this.props.elements.length)
      ) {
        let _validations = next.elements.map(x => ({}));
        this.props.log(
          `creating new validators for container ${this.props.name}`
        );
        this.setState({ _validations });
      }
    }
    setValidator() {
      this.props.validator.validate = () => {
        return Promise.all(
          this.state._validations.map(x => {
            if (x.validate) return x.validate();

            return new Promise((resolve, reject) => {
              resolve();
            });
          })
        );
      };
    }
    onValueChanged() {
      let form = Object.assign(
        {},
        this.props.value || {},
        ...Array.prototype.slice.call(arguments)
      );
      if (!this.props.name) {
        this.props.valueChanged(form);
        return;
      }
      this.props.valueChanged({ [this.props.name]: form });
    }

    onDisplayValueChanged() {
      let form = Object.assign(
        {},
        this.props.displayValue || {},
        ...Array.prototype.slice.call(arguments)
      );
      if (this.props.displayValueChanged) {
        if (!this.props.name) {
          this.props.displayValueChanged(form);
          return;
        }
        this.props.displayValueChanged({ [this.props.name]: form });
      }
    }

    render() {
      this.props.log("render");
      let keys = this.props.value ? Object.keys(this.props.value) : [],
        self = this,
        extraVal = {},
        notifyExtra = [],
        elements = (this.props.elements || [])
          .sort((x, y) => {
            return x.order - y.order;
          })
          .map((x, index) => {
            const FurmlyComponent = componentLocator(x);
            const source = self.props.value;
            const value = source ? this.props.value[x.name] : null;
            const elemProps = {};

            if (
              FurmlyComponent.hasDisplayValue &&
              this.props.displayValueChanged
            ) {
              elemProps.displayValueChanged = this.onDisplayValueChanged;
            }

            if (
              source &&
              source.hasOwnProperty(x.name) &&
              keys.indexOf(x.name) !== -1
            ) {
              keys.splice(keys.indexOf(x.name), 1);
            }

            /*jshint ignore:start*/
            if (!FurmlyComponent) {
              throw new Error(
                "Unknown component:" + JSON.stringify(x, null, " ")
              );
            }

            if (FurmlyComponent.notifyExtra) {
              notifyExtra.push(index);
              return extra => {
                let component = (
                  <FurmlyComponent
                    {...x}
                    {...elemProps}
                    extra={extra}
                    key={x.name}
                    value={value}
                    validator={this.state._validations[index]}
                    valueChanged={this.onValueChanged}
                  />
                );
                if (ComponentWrapper)
                  return ComponentWrapper(
                    x.elementType,
                    x.uid,
                    x.name,
                    component
                  );

                return component;
              };
            }
            let component = (
              <FurmlyComponent
                {...x}
                {...elemProps}
                value={value}
                validator={this.state._validations[index]}
                key={x.name}
                valueChanged={this.onValueChanged}
              />
            );
            return ComponentWrapper
              ? ComponentWrapper(x.elementType, x.uid, x.name, component)
              : component;
            /*jshint ignore:end*/
          });

      if (keys.length || notifyExtra.length) {
        if (!notifyExtra.length) {
          this.props.log(
            "there are extra properties that no component cares about " +
              JSON.stringify(keys, null, " ")
          );
        }

        keys.forEach(x => {
          extraVal[x] = self.props.value[x];
        });

        notifyExtra.forEach(x => {
          elements[x] = elements[x](Object.assign({}, extraVal));
        });
      }
      if (this.props.label)
        return (
          <Section header={<Header text={this.props.label} />}>
            {elements}
          </Section>
        );
      /*jshint ignore:start*/
      return <Section>{elements}</Section>;
      /*jshint ignore:end*/
    }
  }

  return {
    getComponent: () => withLogger(FurmlyContainer),
    FurmlyContainer
  };
};
