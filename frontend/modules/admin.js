import { getWorks, deleteWork, addNewWork, getCategories } from "./api.js";

/**
* Affichage des éléments d'édition sur la page d'accueil si un token JWT est présent dans le localStorage
* @returns : true si admin mode / false si pas admin mode
*/
export function displayAdminEditModeOnMainPage() {
	if (localStorage.getItem("authToken")) {
		//Remplacement de "login" par "logout" dans le nav menu et ajout d'un eventListener dessus et suppression du lien href
		const loginLinkNavBar = document.querySelector(`a[href="login.html"]`).parentElement;
		loginLinkNavBar.innerText = "logout";
		loginLinkNavBar.addEventListener("click", () => {
			localStorage.removeItem("authToken");
			location.reload();
		});
		//Création et insertion de la barre d'édition et les boutons d'édition
		createEditButtonsOnMainPage();
		//Ajout d'un eventListener sur le bouton d'édition du portfolio pour déclencher l'ouverture de la boîte modale
		const editPortfolioButton = document.querySelector(".editIconAndTextPortfolio");
		editPortfolioButton.addEventListener("click", createModalWindow);
		//On retourne à index.js le fait qu'on est en mode admin
		return (true);
	} else {
		//On retourne à index.js le fait qu'on n'est pas en mode admin
		return (false);
	}
}

/**
* Crée la barre d'édition et les boutons d'édition sur la page d'accueil
*/
function createEditButtonsOnMainPage() {
	//Déclaration du bouton d'édition en 2 variantes blanche et noire
	const whiteEditButton = `<i class="fa-regular fa-pen-to-square" style="color: #ffffff;"></i>`;
	const blackEditButton = `<i class="fa-regular fa-pen-to-square" style="color: #000000;"></i>`;

	//Création de la barre d'édition
	const topEditBar = Object.assign(document.createElement("div"),
		{
			classList: "topEditBar", innerHTML: `<div class="editMode">
												${whiteEditButton}
												<p>Mode édition</p>
												</div>
												<p class="publishButton">publier les changements</p>` });
	//On insère la barre d'édition avant tout le reste de la page
	document.querySelector(".main-container").before(topEditBar);

	//Ajout du bouton d'édition sous l'image principale dans l'intro
	const editIconAndTextIntro = Object.assign(document.createElement("div"),
		{ classList: "editIconAndTextIntro", innerHTML: `${blackEditButton}<p>modifier</p>` });
	document.querySelector(".introduction").after(editIconAndTextIntro);

	//Ajout du bouton d'édition à droite de "Mes projets" dans le portfolio
	const editIconAndTextPortfolio = Object.assign(document.createElement("div"),
		{ classList: "editIconAndTextPortfolio", innerHTML: `${blackEditButton}<p>modifier</p>` });
	document.querySelector(".mes-projets h2").after(editIconAndTextPortfolio);
}

/**
* Crée la base de la boîte modale
* @async
*/
async function createModalWindow() {
	//Création de la base de la modale, qui prendra toute la page et assombrira l'arrière plan
	const modalWindow = Object.assign(document.createElement("aside"), { classList: "modalWindow", role: "dialog", ariaModal: true, ariaLabel: "Galerie photo" });
	//Création d'une div "modal-wrapper" qui sera la fenêtre à afficher avec le contenu, centrée sur la page
	const modalWrapper = Object.assign(document.createElement("div"), { classList: "modalWrapper" });
	//Création de la barre de navigation en haut de la boîte modal avec un bouton précédent et un bouton fermer
	const topButtonsModalWindow = Object.assign(document.createElement("div"), { classList: "topButtonsModalWindow" });
	const previousButton = Object.assign(document.createElement("div"),
		{ classList: "previousButton inactive", innerHTML: `<i class="fa-solid fa-arrow-left fa-lg" style="color: #000000;"></i>` });
	const closeButton = Object.assign(document.createElement("div"),
		{ classList: "closeButton", innerHTML: `<i class="fa-solid fa-xmark fa-lg" style="color: #000000;"></i>` });
	topButtonsModalWindow.append(previousButton, closeButton);
	//Création d'une div qui accueillera le contenu des différentes boîtes modales
	const mainContentModal = Object.assign(document.createElement("div"), { classList: "mainContentModal" });
	//On génère le contenu de la 1ère boîte modale à afficher avec le portfolio, dans "mainContentModal" qui ira dans "modalWrapper" après "topButtonsModalWindow"
	await loadModalPorfolio(mainContentModal);
	//On rattache les différents éléments à "modalWrapper"
	modalWrapper.append(topButtonsModalWindow, mainContentModal);
	//On rattache le "modalWrapper" dans la base de la modale "modalWindow"
	modalWindow.append(modalWrapper);

	//On rajoute tous les eventListeners sur la boîte modale
	modalWindow.addEventListener("click", () => {
		modalWindow.remove();
	});
	//stopPropagation pour que l'eventListener reste sur modalWindow et ne s'étende pas à modalWrapper
	modalWrapper.addEventListener("click", (event) => { event.stopPropagation(); });
	closeButton.addEventListener("click", () => {
		modalWindow.remove();
	});

	//On insère la modale après la section "main" une fois qu'elle est complètement finie d'être générée
	document.querySelector("main").after(modalWindow);
}

/**
* Génère le contenu de la 1ère boîte modale à afficher avec le portfolio pour l'édition des projets
* @param {object} mainContentModal : élement HTML, div qui contiendra le portfolio
* @async
*/
async function loadModalPorfolio(mainContentModal) {
	//On crée les éléments à mettre dans "mainContentModal"
	const galleryModalTitle = Object.assign(document.createElement("h1"), { innerText: "Galerie photo" });
	const galleryModalItems = Object.assign(document.createElement("div"), { classList: "galleryModalItems" });
	//On charge les projets dans la div "galleryModalItems"
	await loadWorksInsideModalPortfolio(galleryModalItems);
	//On rajoute un wrapper autour de la galerie pour faciliter le CSS
	const galleryModalWrapper = Object.assign(document.createElement("div"), { classList: "galleryModalWrapper" });
	galleryModalWrapper.append(galleryModalItems);
	//On crée le bouton de validation
	const addPhotoButton = Object.assign(document.createElement("button"), { innerText: "Ajouter une photo", classList: "addPhotoButton" });
	//On rajoute un eventListener sur le bouton de validation
	addPhotoButton.addEventListener("click", () => {
		loadModalAddProject();
	});
	//On crée le bouton / la phrase de suppression
	const deleteGalleryModal = Object.assign(document.createElement("p"), { innerText: "Supprimer la galerie", classList: "deleteGalleryModal" });
	//On vide le contenu de "mainContentModal" (utile si on revient de la boîte modale "AddProject")
	mainContentModal.innerHTML = "";
	//On rattache les différents éléments créés ci-dessus à la div mainContent et à la div modalWrapper
	mainContentModal.append(galleryModalTitle, galleryModalWrapper, addPhotoButton, deleteGalleryModal);
}

/**
* Va chercher l'ensemble des projets via l'API puis les insère dans la div "galleryModalItems"
* @param {object} galleryModalItems : élement HTML, div qui contiendra les projets à afficher
* @async
*/
export async function loadWorksInsideModalPortfolio(galleryModalItems) {
	//Récupération des projets depuis l'API
	const works = await getWorks();
	//On vide le contenu de la div .galleryModalItems, ça servira lors de la suppression d'un projet, pour recharger l'affichage des projets
	galleryModalItems.innerHTML = "";

	//Affichage des projets
	works.forEach(item => {
		//Création des balises nécessaires à l'affichage des projets et des différents bouttons
		const workFigure = document.createElement("figure");
		const figureWrapper = Object.assign(document.createElement("div"), { classList: "figureWrapper" });
		const cardButtons = Object.assign(document.createElement("div"), { classList: "cardButtons" });
		const deleteButton = Object.assign(document.createElement("div"),
			{ classList: "deleteButton", innerHTML: `<i class="fa-solid fa-trash-can fa-2xs" style="color: #ffffff;"></i>` });

		//On rajoute un eventListener sur chaque bouton de suppression
		deleteButton.addEventListener("click", async (event) => {
			//On remonte jusqu'à la div "deleteButton" pour avoir l'ID du projet à supprimer, car l'eventListener peut être déclanché par l'enfants "i" (icône FA) selon où on clique
			let target = event.target;
			let workId = 0;
			if (target.localName === "i") {
				target = target.parentElement;
			}
			workId = Number(target.dataset.workId);
			await deleteWork(workId);
		});
		deleteButton.dataset.workId = `${item.id}`; //Utilisation des dataset pour renseigner l'ID du projet

		const moveButton = Object.assign(document.createElement("div"),
			{ classList: "moveButton inactive", innerHTML: `<i class="fa-solid fa-up-down-left-right fa-2xs" style="color: #ffffff;"></i>` });
		//On rajoute un eventListener sur chaque carte "figureWrapper" pour afficher le bouton de déplacement au survol de la souris
		figureWrapper.addEventListener("mouseover", () => {
			moveButton.classList.remove("inactive");
		});
		figureWrapper.addEventListener("mouseout", () => {
			moveButton.classList.add("inactive");
		});

		cardButtons.append(moveButton, deleteButton);
		figureWrapper.append(Object.assign(document.createElement("img"), { src: item.imageUrl, alt: item.title }), cardButtons);
		workFigure.append(figureWrapper, Object.assign(document.createElement("p"), { innerText: "éditer", classList: "editFigure" }));
		//On rajoute le projet dans la galerie
		galleryModalItems.append(workFigure);
	});
}

/**
* Crée la fenêtre modale pour l'ajout d'un projet
* @async
*/
async function loadModalAddProject() {
	//On récupère les catégories pour pouvoir ensuite les insérer dans le dropdown menu
	const forDropDownMenu = true;
	const categories = await getCategories(forDropDownMenu);
	//On crée le formulaire d'ajout d'un projet
	const addPhotoForm = Object.assign(document.createElement("form"), { id: "addPhotoForm" });
	addPhotoForm.innerHTML = `<fieldset class="addPictureBox">
								<div class="addPictureBoxWrapper">
									<img src="./assets/icons/picture-icon.svg" alt="Picture Icon">
									<label for="imageInput">+ Ajouter Photo</label>
									<p>jpg, png : 4mo max</p>
								</div>
								<input id="imageInput" name="file" type="file" accept="image/jpeg, image/jpg, image/png">
								<output></output>
							</fieldset>
							<fieldset class="addPhotoFormDetails">
								<label for="title">Titre</label>
								<input id="title" name="title" type="text" required>
								<label for="category">Catégorie</label>
								<div class="dropdownMenu">
									<select id="category" name="category" required>
										<option hidden disabled selected value></option>
										${categories}
									</select>
								</div>
							</fieldset>
							<button type="submit" class="confirmAddPhotoButton" style="background-color:#A7A7A7;cursor:not-allowed">Valider</button>`;
	//On vide le contenu de "mainContentModal" (de la précédente boîte modale "Portfolio")
	const mainContentModal = document.querySelector(".mainContentModal");
	mainContentModal.innerHTML = "";
	//On rattache les différents éléments à la div "mainContentModal"
	mainContentModal.append(Object.assign(document.createElement("h1"), { innerText: "Ajout photo" }), addPhotoForm);
	//On démasque le bouton précédent et on y ajoute un eventListener pour revenir à la boîte modale "portfolio"
	const previousButton = document.querySelector(".previousButton");
	previousButton.classList.remove("inactive");
	previousButton.addEventListener("click", () => {
		previousButton.classList.add("inactive");
		const mainContentModal = document.querySelector(".mainContentModal");
		loadModalPorfolio(mainContentModal);
		//On rajoute "once" pour que l'eventListener soit supprimé après avoir été déclenché une fois, car dans la boîte modale "Portfolio" le bouton précédent n'est pas supprimé mais masqué
	}, { once: true });
	addEventListenersOnModalAddProject();
}

/**
* Ajout des eventListeners sur la boîte modale AddPhoto
* @async
*/
async function addEventListenersOnModalAddProject() {
	//Ajout d'un eventListener sur le bouton d'ajout de photo dans le formulaire (label qui pointe vers l'input de type file "imageInput", qui est masqué)
	const imageInput = document.getElementById("imageInput");
	imageInput.addEventListener("change", (event) => {
		//On affiche l'image à la place du champ d'ajout d'image dans le formulaire
		const imageUrl = URL.createObjectURL(event.target.files[0]);
		const imageToDisplay = `<img src="${imageUrl}" class="imageToDisplay">`;
		const addPictureBoxWrapper = document.querySelector(".addPictureBoxWrapper");
		addPictureBoxWrapper.innerHTML = imageToDisplay;
		displayErrorMessageOnModalAddProject();
	});

	//Ajout d'un eventListener sur le champ titre
	const titleForm = document.getElementById("title");
	titleForm.addEventListener("change", () => {
		displayErrorMessageOnModalAddProject();
	});

	//Ajout d'un eventListener sur le champ catégorie
	const categoryForm = document.getElementById("category");
	categoryForm.addEventListener("change", () => {
		displayErrorMessageOnModalAddProject();
	});

	//Ajout d'un eventListener sur le formulaire (y compris le bouton de validation en bas)
	const addPhotoForm = document.getElementById("addPhotoForm");
	addPhotoForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const noErrorMessage = displayErrorMessageOnModalAddProject();
		//On n'ajoute le projet que s'il ni a pas d'erreur sur le formulaire
		if (noErrorMessage) {
			const formData = new FormData();
			formData.append("image", imageInput.files[0]);
			formData.append("title", titleForm.value);
			formData.append("category", Number(categoryForm.value));
			await addNewWork(formData);
		}
	});
}

/**
* Ajout d'un message d'erreur sur la boîte modale AddPhoto sous le bouton de validation
* @returns : true s'il y a une erreur / false si tout est ok
*/
function displayErrorMessageOnModalAddProject() {
	//On repère le bouton de validation et le message d'erreur
	const confirmAddPhotoButton = document.querySelector(".confirmAddPhotoButton");
	let errorMessageAddProject = document.querySelector(".errorMessageAddProject");

	//Si le message d'erreur n'est pas déjà affiché sur la page, on le crée, sinon on le supprime
	if (!errorMessageAddProject) {
		errorMessageAddProject = Object.assign(document.createElement("p"), { classList: "errorMessageAddProject" });
	} else {
		errorMessageAddProject.remove();
	}

	//On récupère les données du formulaire pour les tester ensuite
	const imageToDisplay = document.querySelector(".imageToDisplay");
	const titleForm = document.getElementById("title");
	const categoryForm = document.getElementById("category");

	//Si tous les champs sont remplis, on passe le bouton de validation en vert et on change le curseur
	if (imageToDisplay && titleForm.value && categoryForm.value) {
		confirmAddPhotoButton.style.backgroundColor = "#1D6154";
		confirmAddPhotoButton.style.cursor = "pointer";
		return true;
	}
	//On teste quel champ n'est pas rempli et on affiche le message d'erreur correspondant
	if (!imageToDisplay) {
		confirmAddPhotoButton.style.backgroundColor = "#A7A7A7";
		confirmAddPhotoButton.style.cursor = "not-allowed";
		errorMessageAddProject.innerText = "Veuillez ajouter une image";
		confirmAddPhotoButton.after(errorMessageAddProject);
		return false;
	}
	if (!titleForm.value) {
		confirmAddPhotoButton.style.backgroundColor = "#A7A7A7";
		confirmAddPhotoButton.style.cursor = "not-allowed";
		errorMessageAddProject.innerText = "Veuillez ajouter un titre";
		confirmAddPhotoButton.after(errorMessageAddProject);
		return false;
	}
	if (!categoryForm.value) {
		confirmAddPhotoButton.style.backgroundColor = "#A7A7A7";
		confirmAddPhotoButton.style.cursor = "not-allowed";
		errorMessageAddProject.innerText = "Veuillez ajouter une catégorie";
		confirmAddPhotoButton.after(errorMessageAddProject);
		return false;
	}
}