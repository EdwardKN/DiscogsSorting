var collection = [];

var collectionTable = document.getElementById("collection");

var loaded = document.getElementById("loaded")

var folders = 1;

var selectedFolder = undefined;

var notes = [];



window.addEventListener("load",function(){
    if(localStorage.getItem("collection") == 'undefined'){
        load();
    }else{
        loadSave();
    }
})

function save(){
    localStorage.setItem("collection", JSON.stringify(collection));
    localStorage.setItem("folders", JSON.stringify(folders));
    localStorage.setItem("username",JSON.stringify(document.getElementById("username").value))
    localStorage.setItem("token",JSON.stringify(document.getElementById("token").value))
    localStorage.setItem("notes",JSON.stringify(notes))
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
        rankSelect:"Alla"
    });

    reloadTable();

}

function httpRequest(url, callback){
    const http = new XMLHttpRequest();   
    http.open("GET", url);
    http.send();
    http.onreadystatechange=(e)=>{
        if(e.currentTarget.status !== 200){
            alert("Username, token eller nåt annat skit är fel?!")
            window.location.reload(true)
        }else{
            callback(JSON.parse(http.responseText))
        }
        
    }
    
}

function reload(){
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
        rankSelect:"Alla"
    });

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
            rankSelect:"Alla"
        });
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

    let idImage = document.createElement("img")
    idImage.setAttribute("onclick","this.classList.toggle('active');")

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
    
    for(n = 0; n<notes.length;n++){
        let noteText = document.createElement("td");
        try{
        if(collection[i].notes[n].field_id === (n+1)){
            noteText.innerText = collection[i].notes[n].value;
        }else{
            noteText.innerText = " ";

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
    }
}

// sorting function from w3schools
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("collection");
    switching = true;
    dir = "asc"; 

    while (switching) {
      switching = false;
      rows = table.rows;
    if((rows.length-2) < 500){
        for (i = 2; i < (rows.length - 1); i++) {
            shouldSwitch = false;
    
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if(n !== 0){
                if (dir == "asc") {
                    if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                        shouldSwitch= true;
                        break;
                    }
                } else if (dir == "desc") {
                    if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }else{
                if (dir == "asc") {
                    if (Number(x.innerHTML) > Number(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                  }else if (dir == "desc") {
                    if (Number(x.innerHTML) < Number(y.innerHTML)) {
                        shouldSwitch = true;
                        break;
                    }
                }
                
            }
          }
          if (shouldSwitch) {
    
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;      
          } else {
    
            if (switchcount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
            }
          }
    }else{
        alert("Du försöker sortera mer än 500 releaser. Det kommer att spränga programmet. Vänligen sluta med det.")
    }
      
    }
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
        rankSelect: document.getElementById("rankSelect").value
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



    albumCover.innerText = "Skivomslag"; 
    ranking.innerText = "Betyg"; 
    title.innerText = "Titel"; 
    artist.innerText = "Artist";
    year.innerText = "År";
    folder.innerText = "Mapp";
    genre.innerText = "Genre";
    label.innerText = "Label";

    albumCover.setAttribute("id","rad1Text")
    ranking.setAttribute("id","rad1Text")
    title.setAttribute("id","rad1Text")
    artist.setAttribute("id","rad1Text")
    year.setAttribute("id","rad1Text")
    folder.setAttribute("id","rad1Text")
    genre.setAttribute("id","rad1Text")
    label.setAttribute("id","rad1Text")

    title.setAttribute("onclick","sortTable(3)")
    artist.setAttribute("onclick","sortTable(2)")
    ranking.setAttribute("onclick","sortTable(1)")
    year.setAttribute("onclick","sortTable(4)")
    folder.setAttribute("onclick","sortTable(6)")
    genre.setAttribute("onclick","sortTable(7)")
    label.setAttribute("onclick","sortTable(8)")
    
    column.appendChild(albumCover);
    column.appendChild(ranking);
    column.appendChild(artist);
    column.appendChild(title);
    column.appendChild(year);
    column.appendChild(folder);
    column.appendChild(genre);
    column.appendChild(label);

    for(n = 0; n<notes.length;n++){
        let noteText = document.createElement("td");
        noteText.innerText = notes[n].name;
        noteText.setAttribute("id","rad1Text")
        noteText.setAttribute("onclick",`sortTable(${8+n})`)

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

    let albumCover2 = document.createElement("td");
    let ranking2 = document.createElement("td");

    let title2 = document.createElement("td");
    let artist2 = document.createElement("td");
    let year2 = document.createElement("td");
    let folder2 = document.createElement("td");
    let genre2 = document.createElement("td");
    let label2 = document.createElement("td");

    titleSearch.setAttribute("type","text")
    artistSearch.setAttribute("type","text")
    yearSearch.setAttribute("type","text")
    genreSearch.setAttribute("type","text")
    labelSearch.setAttribute("type","text")

    titleSearch.setAttribute("id","titleSearch")
    artistSearch.setAttribute("id","artistSearch")
    yearSearch.setAttribute("id","yearSearch")
    folderSearch.setAttribute("id","folders")
    rankSelect.setAttribute("id","rankSelect")
    genreSearch.setAttribute("id","genreSearch")
    labelSearch.setAttribute("id","labelSearch")

    titleSearch.setAttribute("onchange","removeRandomDisc()")
    artistSearch.setAttribute("onchange","removeRandomDisc()")
    folderSearch.setAttribute("onchange","removeRandomDisc()")
    rankSelect.setAttribute("onchange","removeRandomDisc()")
    yearSearch.setAttribute("onchange","removeRandomDisc()")
    genreSearch.setAttribute("onchange","removeRandomDisc()")
    labelSearch.setAttribute("onchange","removeRandomDisc()")

    titleSearch.setAttribute("placeholder","Sök")
    artistSearch.setAttribute("placeholder","Sök")
    yearSearch.setAttribute("placeholder","Sök")
    genreSearch.setAttribute("placeholder","Sök")
    labelSearch.setAttribute("placeholder","Sök")

    titleSearch.value = lastSearch.title
    artistSearch.value = lastSearch.artist
    yearSearch.value = lastSearch.year    
    genreSearch.value = lastSearch.genre

    labelSearch.value = lastSearch.label

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
        console.log(sting)
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

    column2.appendChild(albumCover2);
    column2.appendChild(ranking2);
    column2.appendChild(artist2);
    column2.appendChild(title2);
    column2.appendChild(year2);
    column2.appendChild(folder2);
    column2.appendChild(genre2);
    column2.appendChild(label2);

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

    let selected = collection[integer];

    reloadTable(integer);

}

function removeRandomDisc(){
    reloadTable();
    document.getElementById("randomize").setAttribute("onmouseup","getRandomDisc()")
    document.getElementById("randomize").innerText = "Välj slumpmässig skiva"
}
