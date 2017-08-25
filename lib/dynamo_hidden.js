export default props => {
	setTimeout(() => (props.value && props.valueChanged({ [props.name]: props.value })), 0);
	return null;
};
