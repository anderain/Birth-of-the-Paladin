function AnimatedTexture(texture, tilesHoriz, tilesVert, clips, tileDispDuration) 
{   
    // note: texture passed by reference, will be updated by the update function.
        
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    // how many images does this spritesheet contain?
    //  usually equals tilesHoriz * tilesVert, but not necessarily,
    //  if there at blank tiles at the bottom of the spritesheet. 
    // this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
    texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

    // how long should each image be displayed?
    this.tileDisplayDuration = tileDispDuration;

    // how long has the current image been displayed?
    this.currentDisplayTime = 0;
    
    // animation clips
    // like this clips = [ {start:0, end:5}, {start:6, end:7}]
    this.clips = clips;

    // which clip is being played?
    this.currentClip = clips[0];

    // which image is currently being displayed?
    this.currentTile = this.currentClip.start;

    this.update = function( milliSec )
    {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration)
        {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile > this.currentClip.end)
                this.currentTile = this.currentClip.start;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };

    this.playClip = function(index) {
        if (index < 0 || index >= this.clips.length || this.currentClip == this.clips[index]) return;
        this.currentClip = this.clips[index];
        this.currentTile = this.currentClip.start;
    }
}