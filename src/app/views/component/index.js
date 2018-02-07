// project framework
import Application from "lib/gra";
import BasicObject from "lib/mvc/basic/object";
import Pipe from "lib/mvc/progress/pipe";

// Library

// utils
// import {isClass} from "app/utils/verifity";

// Startup pipe
export default class ViewComponent extends BasicObject {
    //
    constructor($name) {
        super($name);
        this.info = {
            status: {
                command: {
                    cmd: "goto",
                    param: ["asia/taiwan"]
                },
                view: "input"
            },
            data: {
                command: ["look", "exit"],
                description: {
                    short: "舞台",
                    long: "這是一個虛擬空間"
                }
            }
        };
    }
    //
    execute() {
        /*
        Execute flow
        1. execute command plugin
        2. when command complete, execute consolne-ui plugin
        3. when console-ui run over, setting next command information, and re-execute view.component.
        */
        let pipe = new Pipe();
        pipe.register(this.command.bind(this), "S2");
        pipe.register(this.render.bind(this), "S3");
        pipe.onComplete = this.renderComplete.bind(this);
        pipe.execute(this.info);
    }
    // Command
    command($progress = null, $resolve = null) {
        if (this.application.controllers.command.has($progress.status.command.cmd)) {
            this.application.controllers.command.execute($progress.status.command.cmd, $progress)
                .then((info) => {
                    $progress = info;
                    $resolve($progress);
                });
          $resolve($progress);
        }
    }
    // Render
    render($progress = null, $resolve = null) {
        if (this.application.controllers.ui.has($progress.status.view)) {
            this.application.controllers.ui.execute($progress.status.view, $progress)
                .then((info) => {
                    $progress = info;
                    $resolve($progress);
                  });
        } else {
            $resolve($progress);
        }
    }
    renderComplete($progress) {
        // next execute flow.
        this.info = $progress;
        if (this.info.status.command !== "" || this.info.status.update !== "" || this.info.status.view !== "") {
            this.execute();
        }
    }
    // Accessor
    get application() {
        return Application.instance;
    }
}
