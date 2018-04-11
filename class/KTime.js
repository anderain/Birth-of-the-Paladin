//----------------------------------------------------
// * KTime
//----------------------------------------------------
// 事件相关函数的模块
//----------------------------------------------------

var KTime = {
    perFrameTime: 0,

    getDeltaTime: function() {
        return (performance.now()  - this.perFrameTime) / 1000;
    },

    nextFrame: function() {
        this.perFrameTime = performance.now();
    }
};