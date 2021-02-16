///////////////////
// Storage
///////////////////
/**
 * PlusStorage represents all storage needed for Plus.
 *
 * It uses simple key-value storage object with 3 methods (set, get, remove).
 *
 */
class PlusStorage {
    /**
     * Key used for storing array of all active counters
     *
     * @type {string}
     * @private
     */
    _counterListKey = "list";
    /**
     * Suffixes used with counter id used for storing data about counter
     *
     * @type {Object}
     * @private
     */
    _suffixes = {
        total: "_total",
        name: "_name"
    };
    /**
     *
     * @type {Object}
     * @private
     */
    _storage = null;

    /**
     *  constructor initialize storage based on available options
     */
    constructor() {
        // testování dostupnosti localStorage
        if (_storageAvailable("localStorage"))
            // nastavení localStorage jako úložiště třídy
            this._storage = _getStorageWrapper(window.localStorage)
        // testování dostupnosti sessionStorage
        else if (_storageAvailable("sessionStorage"))
            // nastavení sessionStorage jako úložiště třídy
            this._storage = _getStorageWrapper(window.sessionStorage)
        // žádná forma Web Storage API není dostupná -> nahrazení prostým JS objektem
        else {
            this._storage = {
                data: {},
                get: function (key) {
                    return this.data[key];
                },
                set: function (key, value) {
                    this.data[key] = value
                },
                remove: function (key) {
                    delete this.data[key]
                }
            }
        }
    }

    /**
     * Vytvoří nový čítač a nastaví hodnotu na 0
     *
     * @param {string} name
     * @returns {string} id
     */
    createCounter(name) {
        let id = btoa(name + Date.now().toString()) // generování unikátního ID pro nový čítač

        // zápis do seznamu čítačů
        let list = this.getCounterList()
        list.push(id)
        this._setCounterList(list)

        // nastavení hodnoty a jména
        this.setName(id, name)
        this.setTotal(id, 0)
        return id
    }

    /**
     * Smaže čítač ze seznamu všech čítačů
     * (data čítače tzn. hodnota a jméno stále zůstávají v úložišti)
     *
     * @param {string} id
     */
    deleteCounter(id) {
        let list = this.getCounterList()
        this._setCounterList(list.filter((fId) => {
            return fId !== id
        }))
    }

    /**
     * Vrací hodnotu čítače
     *
     * @param {string} id
     * @returns {number} total
     */
    getTotal(id) {
        let total = Number(this._storage.get(id + this._suffixes.total))
        if (isNaN(total) || total < 0) { // hodnota čítače je poškozená nebo neexistuje
            return 0
        }
        return Number(total)
    }

    /**
     * Nastaví hodnotu čítače
     *
     * @param {string} id
     * @param {number} total
     */
    setTotal(id, total) {
        this._storage.set(id + this._suffixes.total, total)
    }

    /**
     * Zvýší hodnotu čítače o jedna
     *
     * @param {string} id
     */
    add(id) {
        this.setTotal(id, this.getTotal(id) + 1)
    }

    /**
     * Vrací jméno čítače na základě
     *
     * @param {string} id
     * @returns {string}
     */
    getName(id) {
        let name = this._storage.get(id + this._suffixes.name);
        if (!name) { // jméno neexistuje -> varování v konzoli & nastavení defaultního jména
            console.log(`Unnamed counter! (id ${id})`);
            name = "Unnamed counter";
            this._storage.set(id + this._suffixes.name);
        }
        return name
    }

    /**
     * Nastaví jméno čítače
     *
     * @param {string} id
     * @param {string} name
     */
    setName(id, name) {
        this._storage.set(id + this._suffixes.name, name)
    }

    /**
     * Vrací seznam ID všech čítačů
     *
     * @returns {Array<string>} list
     */
    getCounterList() {
        let jsonList = this._storage.get(this._counterListKey);
        if (!jsonList) return [];
        let list = [];
        try {
            list = JSON.parse(jsonList);
        } catch (e) {
            // poškozený seznam čítačů
            console.error(`corrupted counter list: "${jsonList}"`);
            list = [];
        }
        return list
    }

    /**
     * Nastaví seznam všech ID čítačů
     * (pouze pro interní použití)
     *
     * @param {Array<string>} list
     * @private
     */
    _setCounterList(list) {
        let jsonList = JSON.stringify(list)
        this._storage.set(this._counterListKey, jsonList)
    }

}

/**
 * Vrací obálku kolem Web Storage API pro použití ve třídě Storage
 *
 * @param storage {Storage}
 * @returns {Object} - wrapper
 * @private
 */
function _getStorageWrapper(storage) {
    let pref = function (key) {
        return "plus_" + key
    }
    return {
        get: function (key) {
            return storage.getItem(pref(key))
        },
        set: function (key, value) {
            storage.setItem(pref(key), value)
        },
        remove: function (key) {
            storage.removeItem(pref(key))
        }
    }
}

/**
 * Testování dostupnosti úložište Web Storage API
 * Použit kód z https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
 *
 * @param {string} type - jméno úložiště (jméno atributu objektu window)
 * @returns {boolean}
 * @private
 */
function _storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

///////////////////
// Utilities
///////////////////
/**
 * Vrací aktuální hodnotu URL za # případně null
 *
 * @returns {string|null}
 */
function getURLCounterID() {
    let url = window.location.hash.split("#")
    if (url.length > 1 && url[1]) {
        return url[1]
    } else {
        return null
    }
}

/**
 * Nastaví URL za znakem # podle id
 *
 * @param {string} id
 */
function setURLCounterID(id) {
    window.location.href = window.location.href.split("#")[0] + "#" + id.toString()
}