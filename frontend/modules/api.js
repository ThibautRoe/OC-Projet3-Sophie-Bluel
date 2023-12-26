import { apiUrlWorks, apiUrlCategories, apiUrlLogin } from "./config.js";
import { handleErrorMessagesWhileDeletingWork, handleErrorMessagesWhileAddingWork } from "./works.js";

/**
* Récupération des projets depuis l'API
* @returns
* @async
*/
export async function getWorks() {
	//Récupération des projets depuis l'API
	const res = await fetch(apiUrlWorks);
	//Transformation en JSON
	const works = await res.json();
	return works; //Liste des projets au format JSON
}

/**
* Suppression d'un projet dans la BDD via l'API
* @param {string} workId : ID du projet à supprimer
* @async
*/
export async function deleteWork(workId) {
	//Récupération du token JWT de l'admin loggué et transformation de string vers JSON
	const authToken = localStorage.getItem("authToken");
	const authTokenJSON = JSON.parse(authToken);
	//Suppression du projet via l'API
	const res = await fetch(`${apiUrlWorks}/${workId}`, {
		method: "DELETE",
		headers: { "Authorization": `Bearer ${authTokenJSON.token}` }
	});
	await handleErrorMessagesWhileDeletingWork(res);
}

/**
* Ajout d'un projet dans la BDD via l'API
* @param {object} formData : objet FormData à envoyer à l'API
* @async
*/
export async function addNewWork(formData) {
	//Récupération du token JWT de l'admin loggué et transformation de string vers JSON
	const authToken = localStorage.getItem("authToken");
	const authTokenJSON = JSON.parse(authToken);
	//Ajout du projet via l'API
	const res = await fetch(apiUrlWorks, {
		method: "POST",
		headers: { "Authorization": `Bearer ${authTokenJSON.token}` },
		body: formData
	});
	await handleErrorMessagesWhileAddingWork(res);
}

/**
* Récupération des catégories depuis l'API
* @param {boolean} forDropDownMenu : si true, on formate les catégories en un code HTML qui servira pour le dropdown menu de la boîte modale d'ajout d'un projet
* @returns
* @async
*/
export async function getCategories(forDropDownMenu) {
	if (forDropDownMenu) { //Si pour le dropdown menu de le boîte modale d'ajout de projet
		//Récupération des catégories depuis l'API
		const res = await fetch(apiUrlCategories);
		//Transformation en JSON
		const categories = await res.json();
		//On trie les catégories par ordre alphabétique
		categories.sort((a, b) => {
			if (a.name < b.name) {
				return -1;
			}
			if (a.name > b.name) {
				return 1;
			}
			return 0;
		});
		let categoriesDropdownMenu = "";
		categories.forEach((item) => {
			categoriesDropdownMenu += `<option value="${item.id}">${item.name}</option>
`;
		});
		return categoriesDropdownMenu; //String pour le code HTML du dropdown menu
	} else { //Si pour l'affichage des catégories sur les boutons de filtre sur la page d'accueil, où l'on n'a besoin que des catégories des seuls projets en BDD
		//Récupération des projets depuis l'API
		const works = await getWorks();
		//On extrait les catégories
		let categories = [];
		works.forEach((item) => {
			categories.push(item.category);
		});
		//On supprime les doublons
		categories = categories.filter((value, index, self) =>
			index === self.findIndex((t) => (
				t.id === value.id && t.name === value.name
			))
		);
		return categories; //Liste des catégories au format JSON
	}
}

/**
 * Appel de l'API de login, en POST, avec les valeurs des champs email et password du formulaire
 * @param {string} emailForm : email récupéré depuis le formulaire de login
 * @param {string} passwordForm  : password récupéré depuis le formulaire de login
 * @returns
 * @async 
 */
export async function loginAdmin(emailForm, passwordForm) {
	const res = await fetch(apiUrlLogin, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: emailForm,
			password: passwordForm
		})
	});
	return res;
}