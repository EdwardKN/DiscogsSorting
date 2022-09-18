var collection;

var collectionTable = document.getElementById("collection");

var loaded = document.getElementById("loaded")

function getData(url, callback){
    const http = new XMLHttpRequest();   
    http.open("GET", url);
    http.send();
    http.onreadystatechange=(e)=>{
        callback(JSON.parse(http.responseText))
    }
    
}

function load(){
    document.getElementById("load").remove();
    loaded.innerText = `Laddat: 0 av ?`

    getData("https://api.discogs.com/users/EdwardKN/collection/folders/0/releases?page=1&per_page=5000&token=aEagSeDueOMQaHwpUGTcFPPnWaCTZkSkpnizczvt",function(callback){
        collection = callback.releases;
        loaded.innerText = `Laddat: ${0} av ${collection.length}`

        setOriginalRelease(0)
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
                      } catch(e) {
                        callback2 = 0;
                      }
                    if(i<collection.length && collection[i].basic_information.originalRelease === undefined){
                        if(callback2.year === 0 || callback2.year === undefined){
                            collection[i].basic_information.originalRelease = collection[i].basic_information.year;
                        }else{
                            collection[i].basic_information.originalRelease = callback2.year;
                        }

                        setTimeout(() => {
                            addItems(i);
                            setOriginalRelease(i+1)
                            
                        }, 10);
                    }else if(i == collection.length){
                        loaded.innerText = "";
                    }
                }
                

            //})
        }else{
            collection[i].basic_information.originalRelease = collection[i].basic_information.year;
            console.log("hej")
            setTimeout(() => {
                addItems(i);
                setOriginalRelease(i+1)
                
            }, 1100);
        }
    }
}

function addItems(i){
    let column = document.createElement("tr");
    let id = document.createElement("td")
    let title = document.createElement("td")
    let artist = document.createElement("td")
    let year = document.createElement("td")

    id.innerText = i; 
    title.innerText = collection[i].basic_information.title; 
    artist.innerText = collection[i].basic_information.artists[0].name;
    year.innerText = collection[i].basic_information.originalRelease;

    column.appendChild(id);
    column.appendChild(artist);
    column.appendChild(title);
    column.appendChild(year);


    collectionTable.appendChild(column);

    loaded.innerText = `Laddat: ${i+1} av ${collection.length}`
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

      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;

        x = rows[i].getElementsByTagName("TD")[n];
        y = rows[i + 1].getElementsByTagName("TD")[n];
        if(n === 1 || n === 2){
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
            if (Number(x.innerHTML) > Number(y.innerHTML)) {
                //if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
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