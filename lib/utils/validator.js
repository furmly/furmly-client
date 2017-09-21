export default class Validator {
	constructor(context) {
		this.run = this.run.bind(context);
	}
	run() {
		return new Promise((resolve, reject) => {
			if (
				(!this.props.validators || !this.props.validators.length) &&
				(!this.props.asyncValidators ||
					!this.props.asyncValidators.length)
			)
				return resolve();

			if (this.props.validators) {
				let result = this.props.validators.reduce(
					(current, element) => {
						// statements
						let valid = current.valid,
							error = "";
						switch (element.validatorType) {
							case VALIDATOR_TYPES.REQUIRED:
								valid = this.hasValue();
								break;
							case VALIDATOR_TYPES.MAXLENGTH:
								valid = this.isLessThanMaxLength(element);
								break;
							case VALIDATOR_TYPES.MINLENGTH:
								valid = this.isLessThanMaxLength(element);
								break;
							case VALIDATOR_TYPES.REGEX:
								valid = this.matchesRegex(element);
								break;
						}
						if (typeof valid == "string") {
							error = valid;
							return (
								current.errors.push(error),
								(current.valid = false),
								current
							);
						}
						return current;
					},
					{ errors: [], valid: true }
				);
				if (!result.valid) {
					this.setState(
						Object.assign(this.state, { errors: result.errors })
					);
					return reject();
				}
			}

			if (
				this.props.asyncValidators &&
				this.props.asyncValidators.length &&
				!this.props.valid
			) {
				return reject();
			}

			this.setState(Object.assign(this.state, { errors: null }));
			resolve();
		});
	}
}

export const VALIDATOR_TYPES = {
	REQUIRED: "REQUIRED",
	MAXLENGTH: "MAXLENGTH",
	MINLENGTH: "MINLENGTH",
	REGEX: "REGEX"
};
