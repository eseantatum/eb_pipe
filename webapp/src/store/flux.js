const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
            token: null,
			message: null,
			user_profile: {profile_pic:"../../assets/sentinel.png"},
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			threads: {"twitter":[],"telegram":[]}
		},
		actions: {
			// Use getActions to call a function within a fuction
			exampleFunction: () => {
				getActions().changeColor(0, "green");
			},

			getMessage: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(BASE_API_URL+"/user")
					const data = await resp.json()
					setStore({ message: data.message })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading message from backend", error)
				}
			},
			changeColor: (index, color) => {
				//get the store
				const store = getStore();

				//we have to loop the entire demo array to look for the respective index
				//and change its color
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});

				//reset the global store
				setStore({ demo: demo });
			},
            login: async (email, password) => {
                const opts = {
                    method: 'POST',
                    body: JSON.stringify({
                      "username": email,
                      "password": password
                    },
                    ),
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    }
                  }
                try{
                    const resp = await fetch(BASE_API_URL + '/token', opts)
                            if(resp.status !== 200){
                                alert("Unspecified Error");
                                return false;
                            }
                    const data = await resp.json();
                    // Store token from backend as well as user information provided 
                    // by backend..
                    // Store in local session.
                    sessionStorage.setItem("token", data.access_token)
                    sessionStorage.setItem("user_profile", JSON.stringify(data.user_profile))
                    // Store in store.
                    setStore({ token: data.access_token}); 
                    setStore({ user_profile: data.user_profile});
                    return true;
                } catch(error) {
                    console.error("There has been an error logging in.");

                }
                
            },

			logout: () =>  {
				sessionStorage.removeItem("token");
				sessionStorage.removeItem("user_profile");
				console.log("Logout Complete");
				setStore({ token: null});
				setStore({ user_profile: {profile_pic:"../../assets/sentinel.png"}});
			

			},
            syncTokenFromSessionStore: () => {
                const token = sessionStorage.getItem("token");
				const user_profile = sessionStorage.getItem("user_profile");
                if(token && token !=="" && token !== undefined) setStore({token: token});
				if(user_profile && user_profile !=="" && user_profile !== undefined) setStore({user_profile: JSON.parse(user_profile)});
            },
			getThreads: async () => {
				try{
					// fetching data from the backend
					const resp = await fetch(BASE_API_URL+"/dbq?qt=getconfigs")
					const data = await resp.json()
					setStore({ threads: data.threads })
					// don't forget to return something, that is how the async resolves
					return data;
				}catch(error){
					console.log("Error loading threads from backend", error)
				}
			}
		}
	};
};

export default getState;