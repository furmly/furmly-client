import React,{Component} from "react";

export default (PlatformComponent)=>{
	return class DynamoHTMLViewer extends Component{
		constructor(props){
			super(props);
		}
		render(){
			return <PlatformComponent {...this.props} />
		}
	}
}