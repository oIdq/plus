let storage = new PlusStorage();

const total = "#total"
const name = "#name"


///////////////////
// Service workers
///////////////////

// testování dostupnosti serviceWorker
if ("serviceWorker" in window.navigator) {
    window.navigator.serviceWorker.register("/service-workers.js").then(() => {
        console.log("[ServiceWorker] - Registered");
    })
}

//////////////////
// Init page
//////////////////
$(document).ready(() => {
    // vložení dat do HTML
    refresh()
    renderMenu()

    // zavěšení na event "hashchange" pro případ
    // hashe (údaje v URL za #) -> obnovení informací
    window.addEventListener("hashchange", () => {
        refresh()
    }, false);

    // kliknutí na ikonku menu -> přepnutí viditelnosti menu
    $("header .menu-icon").on('click', (e) => {
        e.preventDefault()
        if (!isMenuVisible()) {
            hideMenu()
        } else {
            showMenu()
        }
    })

    // kliknutí na tlačítko + -> přičtení 1
    $("#add").on("click", () => {
        storage.add(getCounter())
        refresh()
    })

    // kliknutí na tlačítko - -> odečtení 1
    $("#minus").on("click", () => {
        let id = getCounter()
        storage.setTotal(id, storage.getTotal(id) - 1)
        refresh()
    })

    // kliknutí na tlačítko tužky -> přejmenování
    $("#name,#edit").on('click', () => {
        let id = getCounter()
        let name = prompt("Enter new name:", storage.getName(id))
        if (!name) return
        storage.setName(id, name)
        refresh()
    })

    // kliknutí na tlačítko koše -> potvrzení -> odstranění
    $("#delete").on('click', () => {
        let id = getCounter()
        let name = storage.getName(id)
        let c = confirm(`Are you sure you want to delete counter "${name}"?`)
        if (c) {
            storage.deleteCounter(id)
            renderMenu()
            refresh()
        }
    })
})

/**
 * Obnovení zobrazovaných dat
 */
function refresh() {
    let id = getCounter()
    $(total).text(storage.getTotal(id))
    $(name).text(storage.getName(id))
}

/**
 * Vrací aktuální counter, pokud nenajde nic v URL
 * zkouší list všech čítačů a vrátí první
 *
 * Pokud nic nenajde založí nový a vrací jeho ID
 *
 * @return {string} id
 */
function getCounter() {
    let id = getURLCounterID()
    if (id) return id;
    // try #1 counter in list
    let cl = storage.getCounterList()
    if (cl.length > 0) {
        setURLCounterID(cl[0])
        return cl[0]
    }
    // create unnamed counter
    id = storage.createCounter("Unnamed")
    setURLCounterID(id)
    return id
}

/**
 * Vykreslí jednotlivé položky v menu a přidá volbu vytvoření nového
 *
 * Funkce nemění viditelnost menu
 */
function renderMenu() {
    let i = 0
    let menuWrapper = $("#menu-wrapper")

    // vyresetování aktuálního menu
    menuWrapper.html("")

    // přidání odkazů na čítače
    storage.getCounterList().forEach((c) => {
        let name = storage.getName(c)
        menuWrapper.append(`<a href="#${c}" id="menu-item-${i}" class="item">${name}</a>`)
        i++
    })

    // přidání poslední položky
    menuWrapper.append(`<a href="#" id="add-counter" class="item">- Add new counter -</a>`)

    // kliknutí na poslední položku -> proces přidání nového counteru
    $("#add-counter").on('click', (e) => {
        e.preventDefault()
        let name = prompt("Enter new name for new counter:", "Counter")
        let id = storage.createCounter(name)
        setURLCounterID(id)
        renderMenu()
    })

    // kliknutí na položku v menu -> schování menu
    $(".item").on('click', () => {
        hideMenu()
    })
}

/**
 * Rozhoduje jestli je menu aktuálně viditelné
 *
 * @return {boolean}
 */
function isMenuVisible() {
    return $("#menu-wrapper").hasClass("hidden")
}

/**
 * Schová menu
 */
function hideMenu() {
    $("#menu-wrapper").addClass("hidden")
}

/**
 * Zviditelní menu
 */
function showMenu() {
    $("#menu-wrapper").removeClass("hidden")
}
