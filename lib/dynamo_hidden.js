export default props => {
	props.valueChanged({ [props.name]: props.value });
	return null;
};
