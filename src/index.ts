import chalk from "chalk";
import minimist from "minimist";
import prompts from "prompts";

const argv = minimist(process.argv.slice(2),{
    alias: {
        h: "help",
        t: "template"
    },
    string: ["_"],
});

// console.log('argv >>>>>', argv);
const helpMessage = `\
Usage: create-vite [OPTION]... [DIRECTORY]

Create a new Vite project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${chalk.yellow('vanilla-ts     vanilla')}
${chalk.green('vue-ts         vue')}
${chalk.cyan('react-ts       react')}
${chalk.cyan('react-swc-ts   react-swc')}
${chalk.magenta('preact-ts      preact')}
${chalk.redBright('lit-ts         lit')}
${chalk.red('svelte-ts      svelte')}
${chalk.blue('solid-ts       solid')}
${chalk.blueBright('qwik-ts        qwik')}`;

function formatTargetDir (dir: string | undefined) {
    // 去除结尾的斜杠
    return dir?.trim().replace(/\/+$/g,'');
}
const defaultTargetDir = 'vite-project';
async function init () {
    const dir = formatTargetDir(argv._[0]);
    const template = argv.template || argv.t;
    // help是 -h参数，如果命令传入了--help 那么就给出帮助信息
    const help = argv.help;
    if (help) {
        console.log(helpMessage);
        return;
    }
    let targetDir = dir || defaultTargetDir;
    console.log('targetDir >>>>>',targetDir);
    console.log('template >>>>>',template);
    let result: prompts.Answers<'projectName'>;
    try {
        result = await prompts([
            {
                type: targetDir ? null : 'text', // null 表示忽略这个问题，text，select，confirm 表示问题的类型
                name: 'projectName',
                message: chalk.reset('Project name:'),
                initial: defaultTargetDir,
                onState: (state) => {
                    targetDir = formatTargetDir(state.value) || defaultTargetDir;
                }
            }
        ],{
            onCancel: () => {
                throw new Error(chalk.red('Operation cancelled'));
            }
        });
    } catch (error: any) {
        console.log(error.message);
        return;
    }
}

init().catch(e => {
    console.error(e);
});