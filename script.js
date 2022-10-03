var collection = [];

var collectionTable = document.getElementById("collection");

var loaded = document.getElementById("loaded")

var folders = 1;

var selectedFolder = undefined;

var notes = [];

var firstLoad = true;

var value;




window.addEventListener("load",function(){
    if(localStorage.getItem("collection") == 'undefined'){
        load();
    }else{
        loadSave();
    }
});

function save(){
    localStorage.setItem("collection", JSON.stringify(collection));
    localStorage.setItem("folders", JSON.stringify(folders));
    localStorage.setItem("username",JSON.stringify(document.getElementById("username").value))
    localStorage.setItem("token",JSON.stringify(document.getElementById("token").value))
    localStorage.setItem("notes",JSON.stringify(notes))
    localStorage.setItem("worth",JSON.stringify(value))
}
function loadSave(){

    collection = JSON.parse(localStorage.getItem("collection"));
    folders = JSON.parse(localStorage.getItem("folders"));
    document.getElementById("username").value = JSON.parse(localStorage.getItem("username"));
    document.getElementById("token").value = JSON.parse(localStorage.getItem("token"));
    selectedFolder = '0';
    notes = JSON.parse(localStorage.getItem("notes"));
    if(notes == null){
        notes = [];
    }

    let tmpNotes = []; 
    for(i=0;i<notes.length;i++){
        if(notes[i].type === "textarea"){
            tmpNotes.push("")
        }else{
            tmpNotes.push("Alla")
        }
    }
    addFirstColumn({
        id:"",
        title:"",
        artist:"",
        year:"",
        folder:"",
        genre:"",
        notes:tmpNotes,
        rankSelect:"Alla",
        date:""
    });
    value = JSON.parse(localStorage.getItem("worth"));

    document.getElementById("worth").innerText ='Värde: --- Min: ' + value.minimum.split(".")[0].replace(",",".") + ' ---  Med: ' + value.median.split(".")[0].replace(",",".") + ' ---  Max: ' + value.maximum.split(".")[0].replace(",",".") + ' ---';

    reloadTable();

}

function httpRequest(url, callback){

    const http = new XMLHttpRequest();   
    http.open("GET", url);
    http.send();
    http.onreadystatechange=(e)=>{

        if(http.readyState=== 4){

            if(e.currentTarget.status !== 200){
                alert("Username, token eller nåt annat skit är fel?!")
                window.location.reload(true)
            }else{
                callback(JSON.parse(http.responseText))
            }
        }
        
    }
    
}

function reload(){
    firstLoad = true;
    notes = [];
    collection = [];
    folders = 1;
    selectedFolder = undefined;
    collectionTable.innerHTML = "";

    addFirstColumn({
        id:"",
        title:"",
        artist:"",
        year:"",
        folder:"",
        genre:"",
        notes:undefined,
        rankSelect:"Alla",
        date:""
    });
    localStorage.setItem("username",JSON.stringify(document.getElementById("username").value))
    localStorage.setItem("token",JSON.stringify(document.getElementById("token").value))
    load();

}



function load(){
    loaded.innerText = `Laddar...`
    httpRequest("https://api.discogs.com/users/"+document.getElementById('username').value+"/collection/fields?token="+document.getElementById('token').value,function(c){
        notes = c.fields;
        collectionTable.innerHTML = "";
        

        addFirstColumn({
            id:"",
            title:"",
            artist:"",
            year:"",
            originalYear:"",
            folder:"",
            genre:"",
            label:"",
            notes:undefined,
            rankSelect:"Alla",
            date:""
        });
    });
    httpRequest("https://api.discogs.com/users/"+document.getElementById('username').value+"/collection/value?token="+document.getElementById('token').value,function(c){
        value = c;
        document.getElementById("worth").innerText ='Värde: --- Min: ' + value.minimum.split(".")[0].replace(",",".") + ' ---  Med: ' + value.median.split(".")[0].replace(",",".") + ' ---  Max: ' + value.maximum.split(".")[0].replace(",",".") + ' ---';
    });


    httpRequest("https://api.discogs.com/users/"+document.getElementById('username').value+"/collection/folders?token="+document.getElementById('token').value,function(callbackThing){
    
        if(folders == 1){
            folders = callbackThing.folders;  
            let foldersElement = document.getElementById("folders")
            for(i=0;i<folders.length;i++){
                let folder = document.createElement("option")
                folder.value = folders[i].id;
                folder.text = folders[i].name +"("+folders[i].count+")";
                foldersElement.appendChild(folder);
            }
        for(i = 0; i<  Math.ceil(folders[0].count/500); i++){
            httpRequest("https://api.discogs.com/users/"+document.getElementById('username').value+`/collection/folders/0/releases?page=${i+1}&per_page=500&token=`+document.getElementById('token').value,function(callback){
                let newColection = collection.concat(callback.releases);
                collection = newColection;
                if(collection.length === callback.pagination.items){
                    addAllItems();
                }
            })
        }

        }


        
    })
    
}

const addAllItems = async () => {
    for(i = 0; i < collection.length;i++){
        await sleep(1)
        addItems(i)
    }
  }

const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

function addItems(i){
    let column = document.createElement("tr");
    let id = document.createElement("td");
    let ranking = document.createElement("td");
    let title = document.createElement("a");
    let title2 = document.createElement("td");
    let artist = document.createElement("a");
    let artist2 = document.createElement("td");
    let year = document.createElement("td");
    let folder = document.createElement("td");
    let genre = document.createElement("td");
    let label = document.createElement("td");
    let date = document.createElement("td");

    let idImage = document.createElement("img")
    idImage.setAttribute("onclick","this.classList.toggle('active');this.parentNode.classList.toggle('active');")

    idImage.src = collection[i].basic_information.cover_image;
    idImage.style.height = '100px';
    idImage.style.width = '100px';

    title.innerText = collection[i].basic_information.title; 
    for(let y=0; y<collection[i].rating;y++){
        
        ranking.innerText += "★"; 

    }
    artist.innerText = collection[i].basic_information.artists[0].name;
    if(collection[i].basic_information.year === 0){
        year.innerText = "Okänt"
    } else{
        year.innerText = collection[i].basic_information.year;
    }
    for(g = 0;g<folders.length;g++){
        if(collection[i].folder_id === folders[g].id){
            folder.innerText = folders[g].name;

        }

    }
    collection[i].basic_information.labelThing = "";

    genre.innerText = collection[i].basic_information.styles;

    for(g = 0;g<collection[i].basic_information.labels.length;g++){
        collection[i].basic_information.labelThing += collection[i].basic_information.labels[g].name;

    }

    label.innerText = collection[i].basic_information.labelThing;
    date.innerText = collection[i].date_added.split("T")[0];

    title.setAttribute("href",  "https://www.discogs.com/release/"+collection[i].basic_information.id);
    title.setAttribute("target","_blank")
    artist.setAttribute("href",  "https://www.discogs.com/artist/"+collection[i].basic_information.artists[0].id);
    artist.setAttribute("target","_blank")

    title2.appendChild(title);

    artist2.appendChild(artist);

    id.appendChild(idImage);



    column.appendChild(id);
    column.appendChild(ranking);
    column.appendChild(artist2);
    column.appendChild(title2);
    column.appendChild(year);
    column.appendChild(folder);
    column.appendChild(genre);
    column.appendChild(label);
    column.appendChild(date);
    for(n = 0; n<notes.length;n++){
        try{

        if(collection[i].notes[n].field_id === (n+1)){
        }else{
            collection[i].notes[collection[i].notes[n].field_id-1].value = collection[i].notes[n].value
        }
        }catch(e){
        }   
    }
    for(n = 0; n<notes.length;n++){
        let noteText = document.createElement("td");
        try{
        if(collection[i].notes[n].field_id === (n+1)){
            noteText.innerText = collection[i].notes[n].value;
        }else{

        }
        }catch(e){
            try{
                noteText.innerText = " ";
                collection[i].notes[n] = {
                    field_id: n+1,
                    value:" "
                }
            }catch(e){
                noteText.innerText = " ";
                collection[i].notes = []
            
            }

            
        }   

        column.appendChild(noteText);
    
    }

    collectionTable.appendChild(column);

    if(i+1 == collection.length){
        loaded.innerText = "";
        save();
        if(firstLoad == true){
            firstLoad = false;
            setTimeout(() => {
                reloadTable();
            }, 1);
        }
    }
}

  function compareValues(order, type, path) {

    return function innerSort(a, b) {
        

        let comparison = 0;
        if(type === "string"){
            const bandA =  Object.byString(a, path).toUpperCase();
            const bandB = Object.byString(b, path).toUpperCase();
            
            if (bandA > bandB) {
            comparison = 1;
            } else if (bandA < bandB) {
            comparison = -1;
            }
        }else{
            const bandA =  Object.byString(a, path)
            const bandB = Object.byString(b, path)
            
            if (bandA > bandB) {
            comparison = 1;
            } else if (bandA < bandB) {
            comparison = -1;
            }
        }

        return comparison * order;
    }
    }

  var lastPath = "";
  var sortOrder = 1;
  function sortCollection(path,type){
    if(lastPath === path){
        sortOrder *= -1;
    }else{
        lastPath = path;
        if(type === "string"){
            sortOrder = 1;
        }else{
            sortOrder = -1;
        }
    }

    collection.sort(compareValues(sortOrder,type,path));
    save(); 
    reloadTable()
  }
  Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}


async function reloadTable(onlyShow) {
    let noteStates = [];
    for(let x=0;x<notes.length;x++){
        noteStates.push(document.getElementById("noteSearch"+x).value)
    }
    if(document.getElementById("folders").value === ""){
        document.getElementById("folders").value = "0"
        selectedFolder = "0";

    }else{
        selectedFolder = document.getElementById("folders").value;
    }

    let lastSearch = {
        title:document.getElementById("titleSearch").value,
        artist:document.getElementById("artistSearch").value,
        year:document.getElementById("yearSearch").value,
        folder:selectedFolder,
        genre:document.getElementById("genreSearch").value,
        label:document.getElementById("labelSearch").value,
        notes:noteStates,
        rankSelect: document.getElementById("rankSelect").value,
        date: document.getElementById("dateSearch").value
    }

    collectionTable.innerHTML = "";
    addFirstColumn(lastSearch);
    let onlyShowTrue = false;

    for(i=0;i<collection.length;i++){
        

        if(JSON.stringify(collection[i].folder_id) === selectedFolder || selectedFolder === "0"){
            if(JSON.stringify(collection[i].rating) === document.getElementById("rankSelect").value || document.getElementById("rankSelect").value === "Alla"){
                var notesGood = true;

            if(collection[i].basic_information.title.toLowerCase().includes(document.getElementById("titleSearch").value.toLowerCase()) &&
                collection[i].basic_information.artists[0].name.toLowerCase().includes(document.getElementById("artistSearch").value.toLowerCase()) && 
                JSON.stringify(collection[i].basic_information.year).startsWith(document.getElementById("yearSearch").value) &&
                (collection[i].date_added).startsWith(document.getElementById("dateSearch").value) &&
                JSON.stringify(collection[i].basic_information.styles).toLowerCase().includes(document.getElementById("genreSearch").value.toLowerCase()
                )
            ){
                try{
                    if(collection[i].basic_information.labelThing.toLowerCase().includes(document.getElementById("labelSearch").value.toLowerCase())){
                        for(x=0;x<notes.length;x++){
                            try{
                                if((collection[i].notes[x].value.toLowerCase()).includes(document.getElementById("noteSearch"+x).value.toLowerCase())){

                                }else{

                                    if(document.getElementById("noteSearch"+x).value === "Alla"){

                                    }else{

                                        notesGood = false;
                                    }
                                }
                            }catch(e){
                                if(document.getElementById("noteSearch"+x).value === "Alla"){
                                }else{
                                    
                                    notesGood = false;
                                }
                            }
                            
                        }   
                        if(notesGood == true){
                            if(i % 1000 == 0){
                                await sleep(1)
                            }

                            if(onlyShow !== undefined){

                                if(onlyShow === i){
                                    i = collection.length;
                                    addItems(onlyShow)
                                    onlyShowTrue = true;
                                } else{


                                }
                                
                            }else{
                                addItems(i)
                            }
                            
                        }
                        
                    }
                }catch(e){
                }
            }
        }else{
            notesGood = false;
        }
        }
    }
    if(onlyShowTrue == false && onlyShow !== undefined){
        randomize();
    }


}
  

function addFirstColumn(lastSearch){

    let column = document.createElement("tr");
    let albumCover = document.createElement("td");
    let ranking = document.createElement("td");
    let title = document.createElement("td");
    let artist = document.createElement("td");
    let year = document.createElement("td");
    let folder = document.createElement("td");
    let genre = document.createElement("td");
    let label = document.createElement("td");
    let date = document.createElement("td");



    albumCover.innerText = "Skivomslag"; 
    ranking.innerText = "Betyg"; 
    title.innerText = "Titel"; 
    artist.innerText = "Artist";
    year.innerText = "År";
    folder.innerText = "Mapp";
    genre.innerText = "Genre";
    label.innerText = "Label";
    date.innerText = "Datum tillagd";

    albumCover.setAttribute("id","rad1Text")
    ranking.setAttribute("id","rad1Text")
    title.setAttribute("id","rad1Text")
    artist.setAttribute("id","rad1Text")
    year.setAttribute("id","rad1Text")
    folder.setAttribute("id","rad1Text")
    genre.setAttribute("id","rad1Text")
    label.setAttribute("id","rad1Text")
    date.setAttribute("id","rad1Text")

    title.setAttribute("onclick","sortCollection('basic_information.title','string')")
    artist.setAttribute("onclick","sortCollection('basic_information.artists[0].name','string')")
    ranking.setAttribute("onclick","sortCollection('rating','number')")
    year.setAttribute("onclick","sortCollection('basic_information.year')")
    folder.setAttribute("onclick","sortCollection('folder_id','number')")
    genre.setAttribute("onclick","sortCollection('basic_information.genres[0]','string')")
    label.setAttribute("onclick","sortCollection('basic_information.labels[0].name','string')")
    date.setAttribute("onclick","sortCollection('date_added','string')")
    
    column.appendChild(albumCover);
    column.appendChild(ranking);
    column.appendChild(artist);
    column.appendChild(title);
    column.appendChild(year);
    column.appendChild(folder);
    column.appendChild(genre);
    column.appendChild(label);
    column.appendChild(date);

    for(n = 0; n<notes.length;n++){
        let noteText = document.createElement("td");
        noteText.innerText = notes[n].name;
        noteText.setAttribute("id","rad1Text")
        noteText.setAttribute("onclick",`sortCollection('notes[${n}].value','string')`)

        column.appendChild(noteText);
    }


    collectionTable.appendChild(column);




    let column2 = document.createElement("tr");

    let titleSearch = document.createElement("input");
    let artistSearch = document.createElement("input");
    let yearSearch = document.createElement("input");
    let folderSearch = document.createElement("select");
    let rankSelect = document.createElement("select");
    let genreSearch = document.createElement("input");
    let labelSearch = document.createElement("input");
    let dateSearch = document.createElement("input");

    let albumCover2 = document.createElement("td");
    let ranking2 = document.createElement("td");

    let title2 = document.createElement("td");
    let artist2 = document.createElement("td");
    let year2 = document.createElement("td");
    let folder2 = document.createElement("td");
    let genre2 = document.createElement("td");
    let label2 = document.createElement("td");
    let date2 = document.createElement("td");

    ranking2.setAttribute("id","rad2Text")
    title2.setAttribute("id","rad2Text")
    artist2.setAttribute("id","rad2Text")
    year2.setAttribute("id","rad2Text")
    folder2.setAttribute("id","rad2Text")
    genre2.setAttribute("id","rad2Text")
    label2.setAttribute("id","rad2Text")
    date2.setAttribute("id","rad2Text")

    titleSearch.setAttribute("type","text")
    artistSearch.setAttribute("type","text")
    yearSearch.setAttribute("type","text")
    genreSearch.setAttribute("type","text")
    labelSearch.setAttribute("type","text")
    dateSearch.setAttribute("type","text")

    titleSearch.setAttribute("id","titleSearch")
    artistSearch.setAttribute("id","artistSearch")
    yearSearch.setAttribute("id","yearSearch")
    folderSearch.setAttribute("id","folders")
    rankSelect.setAttribute("id","rankSelect")
    genreSearch.setAttribute("id","genreSearch")
    labelSearch.setAttribute("id","labelSearch")
    dateSearch.setAttribute("id","dateSearch")

    titleSearch.setAttribute("onchange","removeRandomDisc()")
    artistSearch.setAttribute("onchange","removeRandomDisc()")
    folderSearch.setAttribute("onchange","removeRandomDisc()")
    rankSelect.setAttribute("onchange","removeRandomDisc()")
    yearSearch.setAttribute("onchange","removeRandomDisc()")
    genreSearch.setAttribute("onchange","removeRandomDisc()")
    labelSearch.setAttribute("onchange","removeRandomDisc()")
    dateSearch.setAttribute("onchange","removeRandomDisc()")

    titleSearch.setAttribute("placeholder","Sök")
    artistSearch.setAttribute("placeholder","Sök")
    yearSearch.setAttribute("placeholder","Sök")
    genreSearch.setAttribute("placeholder","Sök")
    labelSearch.setAttribute("placeholder","Sök")
    dateSearch.setAttribute("placeholder","Sök")

    titleSearch.value = lastSearch.title
    artistSearch.value = lastSearch.artist
    yearSearch.value = lastSearch.year    
    genreSearch.value = lastSearch.genre

    labelSearch.value = lastSearch.label
    dateSearch.value = lastSearch.date

    if(lastSearch.label == undefined){
        labelSearch.value = "";
    }


    for(i=0;i<folders.length;i++){
        let folder = document.createElement("option")
        folder.value = folders[i].id;
        folder.text = folders[i].name +"("+folders[i].count+")";
        folderSearch.appendChild(folder);
    }
    let folderThing = document.createElement("option")
    folderThing.value = "Alla";
    folderThing.text = "Alla";
    rankSelect.appendChild(folderThing);
    for(i=0;i<6;i++){
        let folder = document.createElement("option")
        folder.value = i;
        let sting = "";

        for(let y = 0;y< i;y++){
            sting += "★"; 
        }
        folder.text = sting;
        rankSelect.appendChild(folder);
    }
    folderSearch.value = lastSearch.folder
    rankSelect.value = lastSearch.rankSelect;


    artist2.appendChild(artistSearch);
    title2.appendChild(titleSearch);
    year2.appendChild(yearSearch);
    folder2.appendChild(folderSearch);
    ranking2.appendChild(rankSelect);
    genre2.appendChild(genreSearch);
    label2.appendChild(labelSearch);
    date2.appendChild(dateSearch);

    column2.appendChild(albumCover2);
    column2.appendChild(ranking2);
    column2.appendChild(artist2);
    column2.appendChild(title2);
    column2.appendChild(year2);
    column2.appendChild(folder2);
    column2.appendChild(genre2);
    column2.appendChild(label2);
    column2.appendChild(date2);

    for(n = 0; n<notes.length;n++){
        let noteSearch;
        if(notes[n].type == "textarea"){
            noteSearch = document.createElement("input");
            noteSearch.setAttribute("placeholder","Sök")
        }else{
            noteSearch = document.createElement("select");
            let noteThing = document.createElement("option")
            noteThing.value = "Alla";
            noteThing.text = "Alla";
            noteSearch.appendChild(noteThing);

            for(i=0;i<notes[n].options.length;i++){
                let noteThing = document.createElement("option")
                noteThing.value = notes[n].options[i];
                noteThing.text = notes[n].options[i];


                noteSearch.appendChild(noteThing);
            }
        }
        
        let noteText2 = document.createElement("td");
        noteSearch.setAttribute("type","text")
        noteSearch.setAttribute("id","noteSearch"+n)
        noteSearch.className = "search"
        noteSearch.setAttribute("onchange","removeRandomDisc()")

        if(lastSearch.notes === undefined){
            if(notes[n].type !== "textarea"){
                noteSearch.value = "Alla";
            }else{
                noteSearch.value = "";
            }
        }else{
            noteSearch.value = lastSearch.notes[n];
        }

        
        noteText2.appendChild(noteSearch);
        column2.appendChild(noteText2);

    }

    collectionTable.appendChild(column2);

}

function getRandomDisc(){
    randomize();
    document.getElementById("randomize").setAttribute("onmouseup","removeRandomDisc()")
    document.getElementById("randomize").innerText = "Ta bort slumpmässig skiva"
}
function randomize(){
    let integer = Math.floor(Math.random() * collection.length);

    reloadTable(integer);

}

function removeRandomDisc(){
    reloadTable();
    document.getElementById("randomize").setAttribute("onmouseup","getRandomDisc()")
    document.getElementById("randomize").innerText = "Välj slumpmässig skiva"
}
