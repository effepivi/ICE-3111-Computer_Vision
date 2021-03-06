// Move to V4
// https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3
// https://bl.ocks.org/wnghdcjfe/c2b04ee8430afa32ce76596daa4d8123
//
// https://www.d3-graph-gallery.com/graph/interactivity_zoom.html

var graph_element = d3.select("#graph").node();

var width = Math.floor(graph_element.getBoundingClientRect().width);
var height = 600;

var color = d3.scaleOrdinal(d3.schemeCategory20);

d3.json("network.json", function (error, json) {
  if (error) throw error;

// const simulation = d3.forceSimulation(json.nodes)
//     .force("link", d3.forceLink(json.links).id(d => d.id))
//     .force("charge", d3.forceManyBody())
//     .force("center", d3.forceCenter(width / 2, height / 2));

const simulation = d3.forceSimulation(json.nodes)
    .force("charge", d3.forceManyBody())
    .force("link", d3.forceLink(json.links))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("charge", d3.forceManyBody().strength(function (d, i) {
        var a = i == 0 ? -1000 : -500;
        return a;
    }).distanceMin(50).distanceMax(300));

// var forceLink = d3
//     .forceLink().id(function (d) {
//         return d.id;
//     })
//     .distance(function (d) {
//         return GetNodeDefaults(d.label).linkDistance;
//     })
//     .strength(0.1);

// var simulation = d3.forceSimulation(json.nodes)
//     .force("charge", d3.forceManyBody().strength(function (d, i) {
//         var a = i == 0 ? -2000 : -1000;
//         return a;
//     }).distanceMin(200).distanceMax(1000))
//     .force("center", d3.forceCenter(width / 2, height / 2))
//     .force("y", d3.forceY(0.01))
//     .force("x", d3.forceX(0.01))
//     .on("tick", ticked);

var svg = d3
  .select("#graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(
    d3.zoom().on("zoom", function () {
      svg.attr("transform", d3.event.transform);
    })
  )
  .append("g");


    // Initialize the links
    // var link = svg
    //   .selectAll("line")
    //   .data(json.links)
    //   .enter()
    //   .append("line")
    //     .style("stroke", "#aaa")

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(json.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke-width", function (d) {
      return 3.5 * d.weight;
    });

  var node = svg
    .append("g")
    .attr("class", "node")
    .selectAll("g")
    .data(json.nodes)
    .enter()
    .append("g");

  // Trying to add text next to the nodes with offset (x,y)
  // Failling to add the translation to both circle and text.
  // .append("text")
  // .attr("class", "text")
  // .attr('x', 6)
  // .attr('y', 3)
  // .text(function(d) { return d.name })

  var circles = node
    .append("circle")
    .attr("class", "nodes")
    .attr("r", function (d) {
      return d.weight * 2;
    })
    .style("fill", function (d) {
      return color(d.group);
    })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
  //.on("click", nodeClicked) // Not needed as taken care by dragstarted
  //

  // Trying to add text next to the nodes with offset (x,y)
  // Failling to add the translation to both circle and text.

  var text = node
    .append("text")
    // .attr("class", "text")
    // .selectAll("text")
    // .data(json.nodes)
    // .enter()
    // .append("text")
    //.attr("class", "text")
    .text(function (d) {
      return d.name;
    })
    .attr("x", 6)
    .attr("y", 3)
    .attr("class", "nodeText")
    .attr("dx", 12)
    .attr("dy", ".35em");
    // .attr("stroke", "black");

  // node.append("title").text(function (d) {
  //   return d.id;
  // });

  //simulation.nodes(graph.nodes).on("tick", ticked);

  //simulation.force("link").links(graph.links);

  simulation.nodes(json.nodes).on("tick", ticked);

  simulation.force("link").links(json.links);

  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

    // text.attr("transform", function (d) {
    //   return "translate(" + d.x + "," + d.y + ")";
    // });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;

    element = d3.select(this);

    d.old_r = element.attr("r");
    d.old_fill = element.attr("fill");
    d.old_stroke = element.attr("stroke");

    element.attr("r", d.old_r * 1.5);
    element.attr("fill", "lightcoral");
    element.attr("stroke", "red");

    nodeClicked(d);
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);

    d.fx = null;
    d.fy = null;

    element = d3.select(this);

    element.attr("r", d.old_r);
    element.attr("fill", d.old_fill);
    element.attr("stroke", d.old_stroke);
  }

  // function getArticleByAuthorID(author_id) {
  //   return authorship.filter(function (authorship) {
  //     return authorship.author_id == author_id;
  //   });
  // }

  // function getArticleByID(article_id) {
  //   return articles.filter(function (articles) {
  //     return articles.id == article_id;
  //   });
  // }

  // function getConferenceByID(conference_id) {
  //   return conferences.filter(function (conferences) {
  //     return conferences.id == conference_id;
  //   });
  // }

  // function getAuthorNameByID(author_id) {
  //   return json.nodes[author_id - 1].name;
  // }

  // function getCoAuthorByPaperID(article_id) {
  //   return authorship.filter(function (authorship) {
  //     return authorship.paper_id == article_id;
  //   });
  // }

  // function replaceAll(string, search, replace) {
  //   return string.split(search).join(replace);
  // }

  function nodeClicked(d) {
  //   var fieldNameElement = document.getElementById("side_panel");
  //
  //   //var side_panel = d3.select("#side_panel")
  //
  //   article_ids = getArticleByAuthorID(d.index + 1);
  //   text = "<p>Author: " + d.name;
  //   if (article_ids.length == 1) {
  //     text += ": " + article_ids.length + " article";
  //   } else {
  //     text += ": " + article_ids.length + " articles";
  //   }
  //   text += "</p><p><ul>";
  //
  //   var coauthor_dict = {};
  //
  //   for (i = 0; i < article_ids.length; ++i) {
  //     text += "<li>";
  //
  //     article_id = article_ids[i].paper_id;
  //     co_authors = getCoAuthorByPaperID(article_id);
  //
  //     for (j = 0; j < co_authors.length; ++j) {
  //       if (j == co_authors.length - 1) {
  //         if (co_authors.length == 2) {
  //           text += " and ";
  //         } else if (co_authors.length > 2) {
  //           text += ", and ";
  //         }
  //       } else if (j > 0) {
  //         text += ", ";
  //       }
  //
  //       coauthor = getAuthorNameByID(co_authors[j].author_id);
  //       if (d.index + 1 == co_authors[j].author_id) {
  //         text += "<b>";
  //       } else {
  //         if (coauthor in coauthor_dict) {
  //           coauthor_dict[coauthor] += 1;
  //         } else {
  //           coauthor_dict[coauthor] = 1;
  //         }
  //       }
  //       text += coauthor;
  //       if (d.index + 1 == co_authors[j].author_id) {
  //         text += "</b>";
  //       }
  //     }
  //
  //     article = getArticleByID(article_id)[0];
  //     text += ", " + article.title;
  //
  //     conference_id = article.conference_id;
  //     conference = getConferenceByID(conference_id)[0];
  //
  //     text +=
  //       " in <i>Proc. " + conference.short_name + "</i>, " + conference.year;
  //
  //     if (article.first_page > 0 && article.last_page) {
  //       text += ", ";
  //
  //       if (article.first_page == article.last_page) {
  //         text +=
  //           " page " +
  //           article.first_page.toString() +
  //           "-" +
  //           article.last_page.toString();
  //       } else {
  //         text +=
  //           " pp. " +
  //           article.first_page.toString() +
  //           "-" +
  //           article.last_page.toString();
  //       }
  //     }
  //
  //     if (article.doi != '""') {
  //       doi = replaceAll(article.doi, '"', "");
  //       text += ', doi: <a href="http://doi.org/' + doi + '">' + doi + "</a>";
  //     }
  //     text += "</li>";
  //   }
  //   text += "</ul></p>";
  //
  //   text += "<p>";
  //
  //   number_of_coauthors = Object.keys(coauthor_dict).length;
  //   text += number_of_coauthors.toString();
  //   if (number_of_coauthors > 1) {
  //     text += " co-authors:";
  //   } else {
  //     text += " co-author:";
  //   }
  //   text += "<ul>";
  //
  //   for (var key in coauthor_dict) {
  //     var value = coauthor_dict[key];
  //
  //     // do something with "key" and "value" variables
  //     text += "<li>" + key + ": " + value.toString() + " paper";
  //
  //     if (value > 1) {
  //       text += "s";
  //     }
  //
  //     (" in common</li>");
  //   }
  //   text += "</ul></p>";
  //
  //   // $("side_panel").update(text);
  //   fieldNameElement.innerHTML = text;
  //   // side_panel.text(text);
  }
});
