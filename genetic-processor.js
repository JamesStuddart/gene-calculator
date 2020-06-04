'use strict';
let container = null;
let masterGenes = [];
let allGenes = [];
let codominates = [];
let dominates = [];
let recessives = [];

let selectedGenes = [];

const initialize = async (element, url) => {
    await GetData(url);

    container = element;

    BuildUI();
}

const GetData = async (url) => {

    let response = await fetch(url);
    const data = await response.json();

    let index = 0;

    data.genes.forEach((gene) => {
        gene.id = index;
        index++;
    });

    masterGenes = data.genes;

    codominates = await mapGenes(data.genes.filter(item => item.type.toLowerCase() === 'codom'));
    dominates = await mapGenes(data.genes.filter(item => item.type.toLowerCase() === 'dom'));
    recessives = await mapGenes(data.genes.filter(item => item.type.toLowerCase() === 'rec'));

    console.log(allGenes);
}

const BuildUI = () => {

    container.classList.add('genecalcframe');
    
    BuildGeneList();
    BuildDropDowns();
}

const BuildDropDowns = () => {
    
    let parents = document.createElement('div');
    parents.classList.add('parents');
    parents.appendChild(BuildDropDown('maleGenes', 'Male:'));
    parents.appendChild(BuildDropDown('femaleGenes', 'Female:'));

    container.appendChild(parents);
}

const BuildDropDown = (id, label) => {
    let frag = document.createDocumentFragment();
    
    createSelectedGenesArray(id);

    let wrapper = document.createElement('div');
    wrapper.classList.add('genecalcform');

    let dropdown = document.createElement('input');
    dropdown.setAttribute('id', id);
    dropdown.setAttribute('name', id);
    dropdown.setAttribute('autocomplete', false);
    dropdown.setAttribute('list', 'geneList');

    let lbl = document.createElement('label');
    lbl.setAttribute('for', id);
    lbl.innerText = label;

    let selectGeneList = document.createElement('ul');
    selectGeneList.setAttribute('id', 'selected' + id);

    dropdown.addEventListener('change', function (event) { geneSearchChange(event, selectGeneList); });

    wrapper.appendChild(lbl);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(selectGeneList);
    frag.appendChild(wrapper);
  return frag;
}

const createSelectedGenesArray = (key) => {
    selectedGenes.push({key: key, value: []});
}

const addSelectedGenesArray = (key, value) => {
    let found = selectedGenes.find(x => x.key === key);

    let id = value.id.split('-')[0];

    let gene = masterGenes.find(x => x.id === parseInt(id));
    found.value.push(gene);
}

const geneSearchChange = (event, selectedGenesEl) => {
    const dataEl = event.srcElement.list;

    for (var pick = dataEl.children.length - 1; pick > -1; pick--) {
        if (dataEl.children[pick].value.toLowerCase() === event.srcElement.value.toLowerCase())
            break;
    }

    let selection = {
        id: dataEl.children[pick].dataset.value,
        text: dataEl.children[pick].value
    }

    addSelectedGenesArray(event.target.id, selection);
    
    event.srcElement.value = null;

    const currentGenes = [];

    for (let i = 0; i < selectedGenesEl.children.length; i++) {
        currentGenes.push(selectedGenesEl.children[i].children[0].innerText.toLowerCase());
    }

    if (currentGenes.indexOf(selection.text.toLowerCase()) < 0) {
        let newEl = document.createElement('li');
        newEl.setAttribute('data-value', selection.id);

        newEl.value = selection.text;
        let childspan = document.createElement('span')
        childspan.innerHTML = selection.text;

        newEl.appendChild(childspan);

        let childbutton = document.createElement('span');
        childbutton.classList.add('genecalcremovebutton');
        childbutton.innerHTML = '(remove)';
        childbutton.addEventListener('click', removeTrait, true);
        newEl.appendChild(childbutton);

        selectedGenesEl.appendChild(newEl);
    }
}

const removeTrait = (event) => {
    event.target.parentElement.parentElement.removeChild(event.target.parentElement);
}

const BuildGeneList = (Id) => {

    let datalist = document.createElement('datalist');
    datalist.id = 'geneList';

    let frag = document.createDocumentFragment();

    allGenes.forEach((gene) => {
        let option = document.createElement('option');
        option.value = gene.name;
        option.setAttribute('data-value', gene.id);
        datalist.appendChild(option);
    })

    frag.appendChild(datalist);
    container.appendChild(frag);
}

const mapGenes = async (masterGenes) => {

    var subsetGenes = []

    masterGenes.forEach((gene) => {
        subsetGenes.push({
            id: gene.id + '-' + gene.commonName,
            parentId: null,
            parentName: null,
            name: gene.commonName
        });
        gene.otherNames.forEach(item => subsetGenes.push({
            id: gene.id + '-' + item,
            parentId: gene.id + '-' + gene.commonName,
            parentName: gene.commonName,
            name: item
        }));
    });

    allGenes = allGenes.concat(subsetGenes);

    return subsetGenes;
}

module.exports = { loadData }