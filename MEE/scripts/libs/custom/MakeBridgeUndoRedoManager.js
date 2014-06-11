var MakeBridgeUndoRedoManager = function () {
    
    var undoRedoIndex = -1;
    var undoRedoStack = new Array();    
    var isRedoEnable = false;
    var isUndoPerformed = false;

    this.registerAction = MakeBridgeUndoRedoManager_RegisterAction;
    this.undo = MakeBridgeUndoRedoManager_Undo;
    this.redo = MakeBridgeUndoRedoManager_Redo;
    
    function MakeBridgeUndoRedoManager_RegisterAction(obj) { // Save HTML before performing any action
        
        if (isUndoPerformed) { // While performing undo redo if any new action performed then clear the stack
            var initObj = undoRedoStack[undoRedoIndex];
            var size = undoRedoStack.length;
            var counter = size - (undoRedoIndex +1);
            //console.log("counter for pop:"+counter);
            for (i = 0;i < counter;i++){
                undoRedoStack.pop();
            }
            //undoRedoStack = [];
            //undoRedoIndex = -1;
            // Now Enter the first state of mainTable in the stack as we do on load of MakeBridgeEditor
            //UndoStackPush(initObj);
            isUndoPerformed = false;
        }
        UndoStackPush(obj);
        //console.log(undoRedoStack);
        //console.log("Index of Stack in Register:"+undoRedoIndex);
    }

    function MakeBridgeUndoRedoManager_Undo() { // On press undo return previous index saved html
        
        var myObj = UndoStackPop();
        //console.log("Index of Stack after Undo:"+undoRedoIndex);
    
        return myObj;
    }

    function UndoStackPush(obj) {
        if (undoRedoIndex >= -1) {
            undoRedoIndex++;
            undoRedoStack[undoRedoIndex] = obj;
        }

    }
    function UndoStackPop() {
        
        if (undoRedoIndex >= 0) {
            isUndoPerformed = true;
            undoRedoIndex--;
            var obj = undoRedoStack[undoRedoIndex];
            return obj;
        } else {
            return null;
        }
    }

    function MakeBridgeUndoRedoManager_Redo() { // on Press Redu increase index and send the stack Element
        
        if (isUndoPerformed && undoRedoStack.length > (undoRedoIndex +1) ) {

            undoRedoIndex++;
            //console.log("Index of Stack after Redo:"+undoRedoIndex);
    
            return undoRedoStack[undoRedoIndex];
        }
        else {
            //console.log("Index of Stack after Redo -else:"+undoRedoIndex);
    
            return null;
        }
    }

    

}

