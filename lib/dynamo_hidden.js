export default props => {
	setTimeout(() => props.valueChanged({ [props.name]: props.value }), 0);
	return null;
};
