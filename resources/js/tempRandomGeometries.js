
/*
* @author: Francisco Siles
* @Github user: https://github.com/Fransiro/
*/
var randomGeometries = {
	size : 3000,
	sizeConsensus : 10,
	randomGeometries : function(bounds){
		var toReturn=[];
		for(var i=0;i<randomGeometries.size;i++){
			var toAdd={};
			var southWest = bounds.getSouthWest();
			var northEast = bounds.getNorthEast();
			toAdd['id']=i;
			toAdd['latitude']=southWest.lat()+(Math.random()*(northEast.lat()-southWest.lat()));
			toAdd['longitude']=southWest.lng()+(Math.random()*(northEast.lng()-southWest.lng()));
			toAdd['radius']=posibleRadius[Math.floor(Math.random()*(posibleRadius.length))];
			toAdd['color']=posibleColors[Math.floor(Math.random()*(posibleColors.length))];
			toAdd['pollution']=posiblePollutions[Math.floor(Math.random()*(posiblePollutions.length))];
			toReturn.push(toAdd);
		}
		return toReturn;
	},
	modifyRandomGeometry : function(drewGeometries){
		var toReturn=[];
		var toAdd={};
		var geometriesSize=0;
		jQuery.each(drewGeometries,function(key,geo){
			if(key.indexOf("pending")<0){
				geometriesSize++;
			}
		});
		var id = Math.floor(Math.random()*geometriesSize);
		toAdd['id']= id;
		if(drewGeometries[id].getCenter){
			toAdd['latitude']=drewGeometries[id].getCenter().lat();
			toAdd['longitude']=drewGeometries[id].getCenter().lng();
		}else if(drewGeometries[id].getPosition){
			toAdd['latitude']=drewGeometries[id].getPosition().lat();
			toAdd['longitude']=drewGeometries[id].getPosition().lng()
		}else{
			console.log("ERROR RANDOM no deberia entrar");
		}
		toAdd['radius']=posibleRadius[Math.floor(Math.random()*(posibleRadius.length))];
		toAdd['color']=posibleColors[Math.floor(Math.random()*(posibleColors.length))];
		toAdd['pollution']=posiblePollutions[Math.floor(Math.random()*(posiblePollutions.length))];
		toReturn.push(toAdd);
		return toReturn;
	},
	randomConsensusGeometries : function(bounds){
		var toReturn=[];
		for(var i=0;i<randomGeometries.sizeConsensus;i++){
			var toAdd={};
			var southWest = bounds.getSouthWest();
			var northEast = bounds.getNorthEast();
			toAdd['id']="pending"+i;
			toAdd['latitude']=southWest.lat()+(Math.random()*(northEast.lat()-southWest.lat()));
			toAdd['longitude']=southWest.lng()+(Math.random()*(northEast.lng()-southWest.lng()));
			toAdd['radius']=posibleRadius[Math.floor(Math.random()*(posibleRadius.length))];
			toAdd['color']=posibleColors[Math.floor(Math.random()*(posibleColors.length))];
			toAdd['pollution']=posiblePollutions[Math.floor(Math.random()*(posiblePollutions.length))];
			toReturn.push(toAdd);
		}
		return toReturn;
	}
}

var posibleColors=["red","orange","green","blue","white","yellow"];
var posibleWeights=["high","medium","low"];
var posibleRadius=["high","medium","low"];
var posiblePollutions=["high","medium","low"];
