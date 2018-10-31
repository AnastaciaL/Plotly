function buildMetadata(sample) {
  // Function which builds the metadata panel 
  // Using d3.json to fetch the metadata for a sample
  var metaurl = `/metadata/${sample}`;

  // Fetching JSON data
  d3.json(metaurl).then(successHandle, errorHandle);
  
  function errorHandle(error) {
    console.log(error)
  };
  
  function successHandle(response) {
    // Select the panel with id of #sample-metadata and clear existing metadata

    d3.select("#sample-metadata").html("")
    var metaData = d3.select("#sample-metadata")

    // Using Object.entries to add each key and value pair to the panel
    Object.entries(response).forEach(function([key, value]) {
      console.log(`Adding ${key}: ${value}`);
        metaData.classed("table-responsive", true)
        
        var row = metaData.append("tr");
        var cell1 = row.append("td");
        var cell2 = row.append("td");
        cell1.text(`${key}:`);
        cell2.text(`${value}`);
      });

    
function buildCharts(sample) {
  
  var metaurl = `/samples/${sample}`;

  // Fetch the JSON data and log it
  d3.json(metaurl).then(successHandle, errorHandle);
  
  function errorHandle(error) {
    console.log(error)
  };
  
  function successHandle(response) {
    // @TODO console.log just prints 'object'
    console.log(`Data: ${response}`);

  //Bubble Chart

    // Use otu_ids for the x values, sample_values for the y values
    var xVal = response.otu_ids
    var yVal = response.sample_values
    // Then set up sample_values for the marker size, otu_ids for the marker colors
    var markSize = response.sample_values 
    var markColor = response.otu_ids
    var txtVal = response.otu_labels

    var trace1 = {
      x: xVal,
      y: yVal,
      text: txtVal,
      mode: 'markers',
      marker: {
        color: markColor, 
        size: markSize, 
        cmin: d3.min(markColor),
        cmax: d3.max(markColor),
        colorscale: 'Earth',
        line: {
            color: 'green'
        }
      }
    }
    
    var data = [trace1];
    
    var layout = {
      showlegend: false,
      height: 500,
      width: 1300
    };
    
    Plotly.newPlot('bubble', data, layout);

  // Pie Chart

    // Link dictionaries in a list to be ordered based on the top sample_values and sort them based on sample_values
    var dataLinked = [];
    for (var i = 0; i < response.sample_values.length; i++) {
      var dataDict = {
        sample_values: response.sample_values[i], 
        otu_ids: response.otu_ids[i], 
        otu_labels: response.otu_labels[i]};
      dataLinked.push(dataDict);
    };

    var sortedData = dataLinked.sort((first, second) => second.sample_values - first.sample_values);
    var topTen = sortedData.slice(0, 10);
    console.log(`The top samples: ${topTen}`);

    // Function which takes in a list of dictionaries
    function valueColumn(dictList, key) {
      var newList = [];
      for (var i = 0; i < dictList.length; i++) {
        var values = dictList[i][key];
        newList.push(values);          
      }
      return newList;
    };

    // Set up sample_values as values for the pie chart
    var topVals = valueColumn(topTen, "sample_values");
    console.log(`Top Values: ${topVals}`);
  
    // Use otu_ids as the labels for the pie chart
    var topIDs = valueColumn(topTen, "otu_ids");
    console.log(`OTU IDs: ${topIDs}`);

    // Use otu_labels as the hovertext for the chart
    var topLabels = valueColumn(topTen, "otu_labels");
    console.log(`OTU Labels: ${topLabels}`);

    var data = [{
      values: topVals,
      labels: topIDs, 
      text: 'Belly Button',
      textposition: 'inside',
      marker: {
        colors: green
      },
      domain: {column: 0},
      hovertext: topLabels,
      hole: .4,
      type: 'pie'
    }];
    
    var layout = {
      title: 'Top 10 bacterias',
      height: 400,
      width: 500,
      showlegend: true,
      grid: {rows: 1, columns: 1}
    };
    
    Plotly.newPlot('pie', data, layout);
  };
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();