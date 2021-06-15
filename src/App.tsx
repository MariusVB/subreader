import { useState } from "react";

const allowedTypes = ["string", "number", "array", "object"] as const;

type AllowedType = typeof allowedTypes[number];

type TypeSelect = {
  name: string;
  type: AllowedType;
  id: number;
  children?: TypeSelect[];
};

const editArrayAtIdx = (prev: TypeSelect[], t: TypeSelect, idx: number) => {
  prev[idx] = t;
  return prev;
};

const removeArrayAtIdx = (prev: TypeSelect[], idx: number) =>
  prev.slice(0, idx).concat(prev.slice(idx + 1));

const indent = (depth: number) => " ".repeat(depth * 2);

const typeTreeToString = (
  t?: TypeSelect,
  depth = 0,
  onlyType = false
): string => {
  if (!t) return "";

  let result = onlyType ? "" : indent(depth) + t.name + ": ";
  switch (t.type) {
    case "array":
      result += `Array<${typeTreeToString(t.children?.[0], depth, true)}>`;
      break;
    case "object":
      result +=
        "{\n" +
        t.children?.map((x) => typeTreeToString(x, depth + 1)).join(",\n") +
        "\n" +
        indent(depth) +
        "}";
      break;

    default:
      result += t.type;
  }
  return result;
};

let id = 0;
const newType = () => ({ name: "", type: "string" as AllowedType, id: ++id });

type TypeSelectorProps = {
  value: TypeSelect;
  disabledInput?: boolean;
  onTypeChange: (t: TypeSelect) => void;
  onDelete?: () => void;
};

const TypeSelector = ({
  value,
  disabledInput,
  onTypeChange,
  onDelete,
}: TypeSelectorProps) => {
  const children = value.children || [];

  return (
    <>
      <div style={{ display: "flex", padding: "3px 0" }}>
        Name:
        <input
          style={{ margin: "0 1em" }}
          onChange={(e) => onTypeChange({ ...value, name: e.target.value })}
          value={value.name}
          disabled={disabledInput}
        />
        Type:
        <select
          style={{ margin: "0 1em" }}
          onChange={(e) =>
            onTypeChange({
              ...value,
              // In theory, the cast could fail here, but in practice it never will,
              // as the type is derived directly from allowedTypes which is const
              // and will never change at runtime
              type: e.target.value as AllowedType,
              children: e.target.value === "array" ? [newType()] : [],
            })
          }
          value={value.type}
        >
          {allowedTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {onDelete && <button onClick={onDelete}>-</button>}
      </div>

      {children.map((x, i) => (
        <div style={{ marginLeft: "20px" }} key={`${x.id}`}>
          <TypeSelector
            onDelete={() =>
              onTypeChange({
                ...value,
                children: removeArrayAtIdx(children, i),
              })
            }
            onTypeChange={(t) =>
              onTypeChange({
                ...value,
                children: editArrayAtIdx(children, t, i),
              })
            }
            disabledInput={value.type === "array"}
            value={x}
          />
        </div>
      ))}
      {value.type === "object" && (
        <button
          style={{ margin: "0 0 20px 20px" }}
          onClick={() =>
            onTypeChange({ ...value, children: [...children, newType()] })
          }
        >
          +
        </button>
      )}
    </>
  );
};

const _ = () => {
  const [root, setRoot] = useState<TypeSelect>(newType());

  return (
    <div style={{ padding: "2em", display: "flex" }}>
      <div style={{ width: "50%" }}>
        <h1>Typescript type generator </h1>

        <TypeSelector value={root} onTypeChange={setRoot} />
      </div>

      <div style={{ width: "50%" }}>
        <pre>
          <code>
            {/* {JSON.stringify(root, null, 2)} */}
            {/* {console.log(root)} */}
            <br />
            <br />
            <br />
            {`type ${root.name} = ${typeTreeToString(root, 0, true)}`}
            {/* {root.children?.length > 1
              ? `type = ${root.map(
                  (t) => `{
            ${t.name} : ${t.type}
}`
                )}`
              : `type ${root.name} = ${typeToString(root[0])}`} */}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default _;
