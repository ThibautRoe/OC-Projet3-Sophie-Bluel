import { getWorks, getCategories } from "./api.js";
import { displayWorks } from "./works.js";

/**
* Affichage des catégories sur des boutons de filtre sur la page d'accueil
* @async
*/
export async function displayCategories() {
	//Récupération des catégories depuis l'API
	const categories = await getCategories();
	//Ajout d'un bouton reset / tous
	const filtersDiv = Object.assign(document.createElement("div"), { classList: "filters" });
	let categoryFilter = Object.assign(document.createElement("p"), { classList: "filter-button active", innerText: "Tous" });
	filtersDiv.append(categoryFilter);
	//Boucle d'affichage des boutons de filtre par catégorie
	categories.forEach(item => {
		//Création des balises nécessaires à l'affichage des boutons de filtre
		categoryFilter = Object.assign(document.createElement("p"), { classList: "filter-button", innerText: item.name });
		//On rattache les balises à l'élément du DOM
		filtersDiv.append(categoryFilter);
	});
	//On insère la div "filters" après la div "mes-projets"
	document.querySelector(".mes-projets").after(filtersDiv);
}

/**
* Filtrage des projets affichés sur la page d'accueil en fonction du bouton de filtre sélectionné
* @async
*/
export async function filterBySelectedCategory() {
	//Récupération des projets depuis l'API
	const works = await getWorks();
	//Listing de tous les boutons de filtres
	const listFilterButtons = document.querySelectorAll(".filter-button");
	//Ajout d'un eventListener sur chaque bouton de filtre
	listFilterButtons.forEach((item) => {
		item.addEventListener("click", (event) => {
			//Enregistrement du filtre sélectionné
			const selectedFilter = event.target;
			//Initialisation d'un tableau vide pour les projets filtrés à afficher
			let filteredWorks = [];
			//Ajout d'un style sur le filtre sélectionné
			listFilterButtons.forEach((item) => {
				if (selectedFilter.innerText === item.innerText) {
					item.classList.add("active");
				}
				else {
					item.classList.remove("active");
				}
			});
			//Filtrage des projets selon le filtre sélectionné
			if (selectedFilter.innerText === "Tous") {
				//Pas de changement, on garde tous les projets
				filteredWorks = works;
			}
			else {
				works.forEach((item) => {
					if (item.category.name === selectedFilter.innerText) {
						//On ne garde que les projets correspondant à la catégorie sélectionnée
						filteredWorks.push(item);
					}
				});
			}
			//Affichage des projets
			displayWorks(filteredWorks);
		});
	});
}