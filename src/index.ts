import chalk from "chalk";
import minimist from "minimist";
import prompts from "prompts";

const argv = minimist(process.argv.slice(2), {
  alias: {
    h: "help",
    t: "template",
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
${chalk.yellow("vanilla-ts     vanilla")}
${chalk.green("vue-ts         vue")}
${chalk.cyan("react-ts       react")}
${chalk.cyan("react-swc-ts   react-swc")}
${chalk.magenta("preact-ts      preact")}
${chalk.redBright("lit-ts         lit")}
${chalk.red("svelte-ts      svelte")}
${chalk.blue("solid-ts       solid")}
${chalk.blueBright("qwik-ts        qwik")}`;

function formatTargetDir(dir: string | undefined) {
  // 去除结尾的斜杠
  return dir?.trim().replace(/\/+$/g, "");
}
const defaultTargetDir = "vite-project";

type Framework = {
  name: string;
  display: string;
  color: Function;
  variants: FrameworkVariant[];
};

type FrameworkVariant = {
  name: string;
  display: string;
  color: Function;
  customCommand?: string;
};

const FRAMEWORKS: Framework[] = [
  {
    name: "vue",
    display: "Vue",
    color: chalk.green,
    variants: [
      {
        name: "vue-ts",
        display: "TypeScript",
        color: chalk.blue,
      },
      {
        name: "vue",
        display: "JavaScript",
        color: chalk.yellow,
      },
    ],
  },
  {
    name: "react",
    display: "React",
    color: chalk.cyan,
    variants: [
      {
        name: "react-ts",
        display: "TypeScript",
        color: chalk.blue,
      },
      {
        name: "react-swc-ts",
        display: "TypeScript + SWC",
        color: chalk.blue,
      },
      {
        name: "react",
        display: "JavaScript",
        color: chalk.yellow,
      },
      {
        name: "react-swc",
        display: "JavaScript + SWC",
        color: chalk.yellow,
      },
    ],
  },
];

const TEMPLATES = FRAMEWORKS.map((f) => {
  return f.variants?.map((v) => v.name);
}).reduce((a, b) => {
  return a.concat(b);
}, []);

// console.log(FRAMEWORKS, TEMPLATES);

async function init() {
  const argTargetDir = formatTargetDir(argv._[0]);
  let targetDir = argTargetDir || defaultTargetDir;
  const template = argv.template || argv.t;
  // console.log('targetDir >>>>>',targetDir);
  // console.log('template >>>>>',template);
  let result: prompts.Answers<"projectName">;
  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : "text",
          name: "projectName",
          message: chalk.reset("Project name:"),
          initial: defaultTargetDir,
          onState: (state) => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          type: template && TEMPLATES.includes(template) ? null : "select",
          name: "framework",
          message: chalk.reset("Select a framework:"),
          initial: 0,
          choices: FRAMEWORKS.map((framework) => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            };
          }),
        },
        {
          type: (framework: Framework) =>
            framework && framework.variants ? "select" : null,
          name: "variant",
          message: chalk.reset("Select a variant:"),
          choices: (framework: Framework) =>
            framework.variants.map((variant) => {
              const variantColor = variant.color;
              return {
                title: variantColor(variant.display || variant.name),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(chalk.red("✖") + " Operation cancelled");
        },
      }
    );
  } catch (error: any) {
    console.log(error.message);
    return;
  }
  console.log(result);
  // help是 -h参数，如果命令传入了--help 那么就给出帮助信息
  const help = argv.help;
  if (help) {
    console.log(helpMessage);
    return;
  }
}

init().catch((e) => {
  console.error(e);
});
