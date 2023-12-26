import { getWorks } from "./api.js";
import { loadWorksInsideModalPortfolio } from "./admin.js";

/**
* Affichage des projets sur la page d'accueil
* @param {array} works : liste des projets au format JSON
* @async
*/
export async function displayWorks(works) {
	//Récupération des projets depuis l'API si la fonction ne reçoit pas de projets à afficher
	if (!works) {
		works = await getWorks();
	}
	//Récupération de l'élément du DOM qui accueillera les projets
	const worksDiv = document.querySelector(".gallery");
	//Remise à 0 de la gallerie avant d'afficher les projets (tous ou filtrés)
	worksDiv.innerHTML = "";
	//Boucle d'affichage des projets
	works.forEach(item => {
		//Création des balises nécessaires à l'affichage des projets
		const workFigure = document.createElement("figure");
		const workImage = Object.assign(document.createElement("img"), { src: item.imageUrl, alt: item.title });
		const workFigCaption = Object.assign(document.createElement("figcaption"), { innerText: item.title });
		//On rattache les balises à l'élément du DOM
		workFigure.append(workImage, workFigCaption);
		worksDiv.append(workFigure);
	});
}

/**
 * Gère les messages d'erreur sur la boîte modale de suppression de projet en fonction du retour de l'API
 * @param {object} apiResponse : retour de l'API
 * @async
 */
export async function handleErrorMessagesWhileDeletingWork(apiResponse) {
	//Si la requête valide la suppression du projet (code 204), on recrée la gallerie et les eventListeners (supprimés par 'gallery.innerHTML = "";' dans 'loadWorksInsideModalWindow')
	if (apiResponse.status == 204) {
		//On supprime le message d'erreur s'il y en avait un
		const errorMessageDeleteProject = document.querySelector(".errorMessageDeleteProject");
		if (errorMessageDeleteProject) {
			errorMessageDeleteProject.remove();
		}
		const galleryModalItems = document.querySelector(".galleryModalItems");
		await loadWorksInsideModalPortfolio(galleryModalItems);
		await displayWorks();
	}
	else { //Sinon on affiche un message d'erreur sur la modale
		let errorMessageDeleteProject = document.querySelector(".errorMessageDeleteProject");
		//Si le message d'erreur n'est pas déjà affiché sur la page, on le crée, sinon on le supprime
		if (!errorMessageDeleteProject) {
			errorMessageDeleteProject = Object.assign(document.createElement("p"), { classList: "errorMessageDeleteProject" });
		} else {
			errorMessageDeleteProject.remove();
		}
		//On repère le bouton de validation
		const addPhotoButton = document.querySelector(".addPhotoButton");
		//On rajoute le message d'erreur
		errorMessageDeleteProject.innerText = "Erreur lors de la suppression du projet, veuillez vous délogguer/relogguer";
		addPhotoButton.before(errorMessageDeleteProject);
	}
}


/**
 * Gère les messages d'erreur sur la boîte modale d'ajout de projet en fonction du retour de l'API
 * @param {object} apiResponse : retour de l'API
 * @async
 */
export async function handleErrorMessagesWhileAddingWork(apiResponse) {
	//Si la requête valide l'ajout du projet (code 201), on actualise l'affichage des projets sur la page d'accueil et on ferme la boîte modale
	if (apiResponse.status == 201) {
		await displayWorks();
		const modalWindow = document.querySelector(".modalWindow");
		modalWindow.remove();
	} else { //Sinon on affiche un message d'erreur sur la modale
		//On repère le bouton de validation et le message d'erreur
		const confirmAddPhotoButton = document.querySelector(".confirmAddPhotoButton");
		let errorMessageAddProject = document.querySelector(".errorMessageAddProject");
		//Si le message d'erreur n'est pas déjà affiché sur la page, on le crée
		if (!errorMessageAddProject) {
			errorMessageAddProject = Object.assign(document.createElement("p"),
				{ classList: "errorMessageAddProject", innerText: "Erreur lors de l'ajout du projet, veuillez vous délogguer/relogguer" });
			confirmAddPhotoButton.after(errorMessageAddProject);
		}
	}
}