//import apiConfig from "../../api_config.js";
import React from "react";
const apiConfig = {
  baseUrl: "http://192.168.43.122/api"
};

export const dynamoProcessRan = action => {
  return {
    type: "DYNAMO_PROCESS_RAN",
    id: action.id,
    data: action.data
  };
};
export const dynamoProcessorRan = (id, data, args) => {
  return {
    type: "DYNAMO_PROCESSOR_RAN",
    id: id,
    data: data,
    args: args
  };
};
export const fetchingDynamoProcess = id => {
  return {
    type: "FETCHING_PROCESS",
    id: id
  };
};
export const fetchedDynamoProcess = action => {
  return {
    type: "FETCHED_PROCESS",
    id: action.id,
    data: action.data
  };
};

export const apiError = text => {
  return {
    type: "API_ERROR",
    text
  };
};

export const runningDynamoProcess = id => {
  return {
    type: "DYNAMO_PROCESS_RUNNING",
    id
  };
};

export function fetchDynamoProcess(id) {
  return dispatch => {
    dispatch(fetchingDynamoProcess(id));
    //mock network request.
    setTimeout(function() {
      console.log("low class hoochie mamas");
      dispatch(
        fetchedDynamoProcess({
          id: id,
          data: {
            description: {
              title: "Student Registration Form",
              steps: [
                {
                  form: {
                    elements: [
                      {
                        name: "firstName",
                        label: "Enter your First name",
                        elementType: "INPUT",
                        description: "This is the students first name"
                      },
                      {
                        name: "lastName",
                        label: "Enter your Surname",
                        elementType: "INPUT",
                        description: "This is the students last name"
                      },
                      {
                        name: "medicalRecords",
                        label: "Medical Records",
                        elementType: "SECTION",
                        args: {
                          elements: [
                            {
                              name: "name",
                              label: "Disease name",
                              elementType: "INPUT",
                              description: "This is the students first name"
                            }
                          ]
                        },
                        description: "Students Medical Records"
                      }
                    ]
                  }
                },
                {
                  form: {
                    elements: [
                      {
                        name: "status",
                        label: "Married",
                        args: {
                          type: "checkbox"
                        },
                        elementType: "INPUT"
                      },
                      {
                        name: "dob",
                        label: "Date of Birth",
                        elementType: "INPUT",
                        args: {
                          type: "date"
                        },
                        description: ""
                      },
                      {
                        name: "gender",
                        label: "Gender",
                        elementType: "SELECT",
                        description: "",
                        args: {
                          type: "PROCESSOR",
                          config: {
                            value: "jag013u14neengbaooghhq01"
                          }
                        }
                      },
                      {
                        name: "sexuality",
                        label: "Sexuality",
                        elementType: "SELECTSET",
                        args: {
                          items: [
                            {
                              id: "HETEROSEXUAL",
                              displayLabel: "Heterosexual",
                              elements: []
                            },
                            {
                              id: "BISEXUAL",
                              displayLabel: "Bisexual",
                              elements: [
                                {
                                  name: "preference",
                                  label: "Preference",
                                  elementType: "SELECT",
                                  description: "",
                                  args: {
                                    type: "PROCESSOR",
                                    config: {
                                      value: "jag013u14neengbaooghhq01"
                                    }
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            },
            data: {
              firstName: "Chidi",
              lastName: "Onuekwusi",
              medicalRecords: {
                name: "Sea Sickness"
              }
            }
          }
        })
      );
    }, 1);

    // fetch(`${apiConfig.baseUrl}/process/${id}`)
    //   .then(response => {
    //     dispatch(fetchedDynamoProcess({ id: id, data: response.json() }));
    //   })
    //   .catch(er => {
    //     dispatch(apiError("Failed to fetch process description.."));
    //   });
  };
}
export function runDynamoProcessor(id, args) {
  return dispatch => {
    setTimeout(() => {
      dispatch(
        dynamoProcessorRan(
          id,
          [
            { _id: "MALE", displayLabel: "Male" },
            { _id: "FEMALE", displayLabel: "Female" }
          ],
          args
        )
      );
    }, 1);
    // fetch(`${apiConfig.baseUrl}/processor/run/${id}`, {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify(args)
    // })
    //   .then(response => dispatch(dynamoProcessorRan(id, response.json(), args)))
    //   .catch(er =>
    //     dispatch(apiError("An error occurred while running process"))
    //   );
  };
}
export function runDynamoProcess(details) {
  return dispatch => {
    dispatch(runningDynamoProcess(details));
    setTimeout(() => {
      dispatch(
        dynamoProcessRan({
          id: details.id,
          data: { message: "successfully completed process!" }
        })
      );
    }, 1);
    // fetch(`${apiConfig.baseUrl}/process/run/${details.id}`, {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     instanceId: details.instanceId
    //   })
    // })
    //   .then(response => {
    //     dispatch(
    //       dynamoProcessRan({
    //         id: details.id,
    //         data: response.json()
    //       })
    //     );
    //   })
    //   .catch(er => {
    //     dispatch(apiError("An error occurred while running process"));
    //   });
  };
}
