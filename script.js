var collection;

var collectionTable = document.getElementById("collection");

var loaded = document.getElementById("loaded")

var folders = 1;

var selectedFolder = undefined;



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
}
function loadSave(){
    
    collection = JSON.parse(localStorage.getItem("collection"));
    folders = JSON.parse(localStorage.getItem("folders"));
    document.getElementById("username").value = JSON.parse(localStorage.getItem("username"));
    document.getElementById("token").value = JSON.parse(localStorage.getItem("token"));
    selectedFolder = '0';
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
    collection = undefined;
    folders = 1;
    selectedFolder = undefined;
    collectionTable.innerHTML = "";
    addFirstColumn({
        id:"",
        title:"",
        artist:"",
        year:"",
        folder:"",
        genre:""
    });
    load();

}



function load(){
    loaded.innerText = `Laddar...`
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
      
        httpRequest("https://api.discogs.com/users/"+document.getElementById('username').value+"/collection/folders/0/releases?page=1&per_page=5000&token="+document.getElementById('token').value,function(callback){
                collection = callback.releases;
    
                setOriginalRelease(0)
            })
        }
        
    })
    
}



function setOriginalRelease(i){

    if(collection[i].basic_information.originalRelease === undefined){
        if(collection[i].basic_information.master_url !== null){

        

            //getData(collection[i].basic_information.master_url+"?token=aEagSeDueOMQaHwpUGTcFPPnWaCTZkSkpnizczvt",function(callback2){
                if(collection[i].basic_information.originalRelease === undefined){
                     
                    let callback2 = {year:0};

                    try {
                        callback2 = {year:Number(collection[i].notes[0].value)}

                        if(i<collection.length && collection[i].basic_information.originalRelease === undefined){
                            if(callback2.year === 0 || callback2.year === undefined){
                                collection[i].basic_information.originalRelease = Number(collection[i].basic_information.year);
                            }else{
                                collection[i].basic_information.originalRelease = Number(callback2.year);
                            }
    
                            
                        }else if(i == collection.length){
                            loaded.innerText = "";
                        }

                        addItems(i);
                        setOriginalRelease(i+1)
                            
                      } catch(e) {
                        httpRequest(collection[i].basic_information.master_url+"?token="+document.getElementById('token').value,function(callback2){
                            if(i<collection.length && collection[i].basic_information.originalRelease === undefined){
                                if(callback2.year === 0 || callback2.year === undefined){
                                    collection[i].basic_information.originalRelease = Number(collection[i].basic_information.year);
                                }else{
                                    collection[i].basic_information.originalRelease = Number(callback2.year);
                                }
                                setTimeout(() => {
                                    addItems(i);
                                    setOriginalRelease(i+1)
                                    
                                }, 2000);
                                
                            }else if(i == collection.length){
                                loaded.innerText = "";
                            }

                        });
                    }
                    
                }
                

            //})
        }else{
            collection[i].basic_information.originalRelease = Number(collection[i].basic_information.year);
                addItems(i);
                setOriginalRelease(i+1);
        }
    }
}

function addItems(i){
    let column = document.createElement("tr");
    let id = document.createElement("td");
    let title = document.createElement("a");
    let title2 = document.createElement("td");
    let artist = document.createElement("a");
    let artist2 = document.createElement("td");
    let year = document.createElement("td");
    let originalYear = document.createElement("td");
    let folder = document.createElement("td");
    let genre = document.createElement("td");
    let label = document.createElement("td");
    

    id.innerText = i; 
    title.innerText = collection[i].basic_information.title; 
    artist.innerText = collection[i].basic_information.artists[0].name;
    if(collection[i].basic_information.year === 0){
        year.innerText = "Okänt"
    } else{
        year.innerText = collection[i].basic_information.year;
    }
    originalYear.innerText = collection[i].basic_information.originalRelease;
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

    column.appendChild(id);
    column.appendChild(artist2);
    column.appendChild(title2);
    column.appendChild(year);
    column.appendChild(originalYear);
    column.appendChild(folder);
    column.appendChild(genre);
    column.appendChild(label);


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

      for (i = 2; i < (rows.length - 1); i++) {
        shouldSwitch = false;

        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if(n === 1 || n === 2 || n === 3 || n === 4 || n === 5 || n === 6 || n === 7){
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
    }
  }

function reloadTable(event) {
    if(document.getElementById("folders").value === ""){
        document.getElementById("folders").value = "0"
        selectedFolder = "0";

    }else{
        selectedFolder = document.getElementById("folders").value;
    }

    let lastSearch = {
        id:document.getElementById("idSearch").value,
        title:document.getElementById("titleSearch").value,
        artist:document.getElementById("artistSearch").value,
        year:document.getElementById("yearSearch").value,
        originalYear:document.getElementById("originalYearSearch").value,
        folder:selectedFolder,
        genre:document.getElementById("genreSearch").value,
        label:document.getElementById("labelSearch").value
    }

    collectionTable.innerHTML = "";
    addFirstColumn(lastSearch);
    for(i=0;i<collection.length;i++){

        if(collection[i].folder_id == selectedFolder || selectedFolder === "0"){
            
            if(JSON.stringify(i).includes(document.getElementById("idSearch").value) &&
                collection[i].basic_information.title.toLowerCase().includes(document.getElementById("titleSearch").value.toLowerCase()) &&
                collection[i].basic_information.artists[0].name.toLowerCase().includes(document.getElementById("artistSearch").value.toLowerCase()) && 
                JSON.stringify(collection[i].basic_information.year).startsWith(document.getElementById("yearSearch").value) &&
                JSON.stringify(collection[i].basic_information.originalRelease).startsWith(document.getElementById("originalYearSearch").value) &&
                JSON.stringify(collection[i].basic_information.styles).toLowerCase().includes(document.getElementById("genreSearch").value.toLowerCase()
                )
            ){
                if(collection[i].basic_information.labelThing.toLowerCase().includes(document.getElementById("labelSearch").value.toLowerCase())){
                    addItems(i);
                }
            }
        }
    }

    

}
  
function addFirstColumn(lastSearch){

    let column = document.createElement("tr");
    let id = document.createElement("td");
    let title = document.createElement("td");
    let artist = document.createElement("td");
    let year = document.createElement("td");
    let originalYear = document.createElement("td");
    let folder = document.createElement("td");
    let genre = document.createElement("td");
    let label = document.createElement("td");

    id.innerText = "Id"; 
    title.innerText = "Titel"; 
    artist.innerText = "Artist";
    year.innerText = "År";
    originalYear.innerText = "Utgivningsår";
    folder.innerText = "Mapp";
    genre.innerText = "Genre";
    label.innerText = "Label";

    id.setAttribute("id","rad1Text")
    title.setAttribute("id","rad1Text")
    artist.setAttribute("id","rad1Text")
    year.setAttribute("id","rad1Text")
    originalYear.setAttribute("id","rad1Text")
    folder.setAttribute("id","rad1Text")
    genre.setAttribute("id","rad1Text")
    label.setAttribute("id","rad1Text")

    id.setAttribute("onclick","sortTable(0)")
    title.setAttribute("onclick","sortTable(1)")
    artist.setAttribute("onclick","sortTable(2)")
    year.setAttribute("onclick","sortTable(3)")
    originalYear.setAttribute("onclick","sortTable(4)")
    folder.setAttribute("onclick","sortTable(5)")
    genre.setAttribute("onclick","sortTable(6)")
    label.setAttribute("onclick","sortTable(7)")
    
    column.appendChild(id);
    column.appendChild(artist);
    column.appendChild(title);
    column.appendChild(year);
    column.appendChild(originalYear);
    column.appendChild(folder);
    column.appendChild(genre);
    column.appendChild(label);


    collectionTable.appendChild(column);

    let column2 = document.createElement("tr");

    let idSearch = document.createElement("input");
    let titleSearch = document.createElement("input");
    let artistSearch = document.createElement("input");
    let yearSearch = document.createElement("input");
    let originalYearSearch = document.createElement("input");
    let folderSearch = document.createElement("select");
    let genreSearch = document.createElement("input");
    let labelSearch = document.createElement("input");

    let id2 = document.createElement("td");
    let title2 = document.createElement("td");
    let artist2 = document.createElement("td");
    let year2 = document.createElement("td");
    let originalYear2 = document.createElement("td");
    let folder2 = document.createElement("td");
    let genre2 = document.createElement("td");
    let label2 = document.createElement("td");

    idSearch.setAttribute("type","text")
    titleSearch.setAttribute("type","text")
    artistSearch.setAttribute("type","text")
    yearSearch.setAttribute("type","text")
    originalYearSearch.setAttribute("type","text")
    genreSearch.setAttribute("type","text")
    labelSearch.setAttribute("type","text")

    idSearch.setAttribute("id","idSearch")
    titleSearch.setAttribute("id","titleSearch")
    artistSearch.setAttribute("id","artistSearch")
    yearSearch.setAttribute("id","yearSearch")
    originalYearSearch.setAttribute("id","originalYearSearch")
    folderSearch.setAttribute("id","folders")
    genreSearch.setAttribute("id","genreSearch")
    labelSearch.setAttribute("id","labelSearch")

    idSearch.setAttribute("onchange","reloadTable.call(this, event)")
    titleSearch.setAttribute("onchange","reloadTable.call(this, event)")
    artistSearch.setAttribute("onchange","reloadTable.call(this, event)")
    folderSearch.setAttribute("onchange","reloadTable.call(this, event)")
    yearSearch.setAttribute("onchange","reloadTable.call(this, event)")
    originalYearSearch.setAttribute("onchange","reloadTable.call(this, event)")
    genreSearch.setAttribute("onchange","reloadTable.call(this, event)")
    labelSearch.setAttribute("onchange","reloadTable.call(this, event)")

    idSearch.setAttribute("placeholder","Sök")
    titleSearch.setAttribute("placeholder","Sök")
    artistSearch.setAttribute("placeholder","Sök")
    yearSearch.setAttribute("placeholder","Sök")
    originalYearSearch.setAttribute("placeholder","Sök")
    genreSearch.setAttribute("placeholder","Sök")
    labelSearch.setAttribute("placeholder","Sök")

    idSearch.value = lastSearch.id 
    titleSearch.value = lastSearch.title
    artistSearch.value = lastSearch.artist
    yearSearch.value = lastSearch.year    
    originalYearSearch.value = lastSearch.originalYear    
    genreSearch.value = lastSearch.genre

    labelSearch.value = lastSearch.label

    if(lastSearch.label == undefined){
        labelSearch.value = "";
    }
    if(lastSearch.originalYear == undefined){
        originalYearSearch.value = "";
    }

    for(i=0;i<folders.length;i++){
        let folder = document.createElement("option")
        folder.value = folders[i].id;
        folder.text = folders[i].name +"("+folders[i].count+")";
        folderSearch.appendChild(folder);
    }
    folderSearch.value = lastSearch.folder


    id2.appendChild(idSearch);
    artist2.appendChild(artistSearch);
    title2.appendChild(titleSearch);
    year2.appendChild(yearSearch);
    originalYear2.appendChild(originalYearSearch);
    folder2.appendChild(folderSearch);
    genre2.appendChild(genreSearch);
    label2.appendChild(labelSearch);

    column2.appendChild(id2);
    column2.appendChild(artist2);
    column2.appendChild(title2);
    column2.appendChild(year2);
    column2.appendChild(originalYear2);
    column2.appendChild(folder2);
    column2.appendChild(genre2);
    column2.appendChild(label2);

    collectionTable.appendChild(column2);

}

addFirstColumn({
    id:"",
    title:"",
    artist:"",
    year:"",
    originalYear:"",
    folder:"",
    genre:"",
    label:""
});