export default props => {
	setTimeout(
		() =>
			(props.value || (props.args && props.args.default)) &&
			props.valueChanged({
				[props.name]: props.value || (props.args && props.args.default)
			}),
		0
	);
	return null;
};
