function buildMetadata(sample) {
  // @TODO: Complete the following function that builds the metadata panel
  // Use d3.json to fetch the metadata for a sample
  var metaurl = `/metadata/${sample}`;

  // Fetching JSON data
  d3.json(metaurl).then(successHandle, errorHandle);
  
  function errorHandle(error) {
    console.log(error)
  };
  
  function successHandle(response) {
    // Use `.html("") to clear any existing metadata
    d3.select("#sample-metadata").html("")
    var metaData = d3.select("#sample-metadata")

    // Using Object.entries to add each key and value pair to the panel
    Object.entries(response).forEach(([key, value]) => {
      d3.select('#sample-metadata')
      .append("li").text(`${key}: ${value}`)
    });

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

  });
}

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
    // Then set up sample_values for the marker size, otu_ids for the marker colors
    var xVal = response.otu_ids
    var yVal = response.sample_values
    var markSize = response.sample_values 
    var markColor = response.otu_ids
    var txtVal = response.otu_labels

    var trace1 = [{
      x: xVal,
      y: yVal,
      text: txtVal,
      mode: 'markers',
      marker: {
        color: markColor, 
        size: markSize,
        }
      }];
    }
    
    var bubble_layout = {
      showlegend: false,
      height: 500,
      width: 1300
    };
    
    Plotly.newPlot('bubble', trace1, bubble_layout);

  // Pie Chart

    // Link dictionaries in a way so that they would be ordered based on the top sample_values and sort them based on sample_values
    var dataLinked = [];
    for (var i = 0; i < response.sample_values.length; i++) {
      var dataDict = {
        sample_values: response.sample_values[i], 
        otu_ids: response.otu_ids[i], 
        otu_labels: response.otu_labels[i]};
      dataLinked.push(dataDict);
    };

    var sortedData = dataLinked.sort((first, second) => second.sample_values - first.sample_values);
    var topten = sortedData.slice(0, 10);
    console.log(`The top samples: ${topten}`);

    function valueColumn(dictList, key) {
      var newList = [];
      for (var i = 0; i < dictList.length; i++) {
        var values = dictList[i][key];
        newList.push(values);          
      }
      return newList;
    };

    // Set up sample_values as values for the pie chart, then otu_ids as the labels for the pie chart
    // and use otu_labels as the hovertext for the chart
    var topVals = valueColumn(topten, "sample_values");
    console.log(`Top Values: ${topVals}`);
  
    var topIDs = valueColumn(topten, "otu_ids");
    console.log(`OTU IDs: ${topIDs}`);

    var topLabels = valueColumn(topten, "otu_labels");
    console.log(`OTU Labels: ${topLabels}`);

    var trace2 = [{
      values: topVals,
      labels: topIDs, 
      text: 'Belly button',
      textposition: 'inside',
      hovertext: topLabels,
      type: 'pie'
    }];
    
    var pie_layout = {
      title: 'Top 10 bacterias',
      height: 400,
      width: 500,
      showlegend: true,
    };
    
    Plotly.newPlot('pie', trace2, pie_layout);
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