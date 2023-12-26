import { loginAdmin } from "./modules/api.js";

/**
* Ajout d'un eventListener sur le bouton de connexion
*/
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", async (event) => {
	//On empêche le rechargement de la page lors de la validation du formulaire, pour pouvoir traiter nous-mêmes les données
	event.preventDefault();
	//On récupère les données du formulaire
	const emailForm = event.target.querySelector("[name=email]").value;
	const passwordForm = event.target.querySelector("[name=password]").value;
	//On appel la fonction de login
	const apiResponse = await loginAdmin(emailForm, passwordForm);

	//Si la requête ne valide pas l'authentification de l'utilisateur (tous les codes de retour sauf 200), on affiche un message d'erreur
	if (apiResponse.status !== 200) {
		//On n'affiche le message d'erreur sur la page que s'il n'existe pas déjà, le == null permet de tester si "null" ou "undefined"
		if (document.querySelector(".errorMessage") == null) {
			const errorMessage = Object.assign(document.createElement("p"),
				{ classList: "errorMessage", innerText: "Erreur dans l'identifiant ou le mot de passe" });
			document.getElementById("password").after(errorMessage);
		}
	}
	//Si la requête valide l'authentification de l'utilisateur
	else {
		//Si le message d'erreur était affiché, on le retire de la page
		if (document.querySelector(".errorMessage") !== null) {
			document.querySelector(".errorMessage").remove();
		}

		//On transforme la réponse de l'API en JSON, ce qui nous donne un objet avec le userId et le token JWT
		const authTokenJSON = await apiResponse.json();
		//On sérialise l'objet JSON pour ensuite pouvoir le stocker dans le localStorage
		const authToken = JSON.stringify(authTokenJSON);

		/* Le moyen le plus secure de stocker un JWT côté client est via un cookie en HttpOnly, mais ce genre de cookie ne peut pas être créé en JS : "Cookies created via JavaScript cannot include the HttpOnly flag" / https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
		Pour ce projet j'utiliserai finalement le localStorage car ça revient au même qu'un cookie classique niveau sécurité
		*/

		//On stocke ces informations dans le localStorage
		window.localStorage.setItem("authToken", authToken);

		//On renvoit vers la page d'accueil
		window.location.href = "./index.html";
	}
});