import { displayAdminEditModeOnMainPage } from "./modules/admin.js";
import { displayCategories, filterBySelectedCategory } from "./modules/categories.js";
import { displayWorks } from "./modules/works.js";

//Affichage des éléments d'édition sur la page d'accueil et stockage du status "admin mode"
const editMode = displayAdminEditModeOnMainPage();

//Affichage des catégories si on n'est pas en mode admin
if (!editMode) {
	displayCategories();
	filterBySelectedCategory();
}

//Affichage des projets
displayWorks();