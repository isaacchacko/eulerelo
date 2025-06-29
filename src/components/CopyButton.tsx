
import { Copy } from '@geist-ui/icons';
import { useState } from "react";

const CopyButton = (props: { text: string; buttonText: string; }) => {

  const [buttonText, setButtonText] = useState(props.buttonText);

  const click = (text: string) => {
    navigator.clipboard.writeText(text);
    const oldButtonText = buttonText;
    setButtonText("Copied!");
    setTimeout(() => {
      setButtonText(oldButtonText);
    }, 2000);
  }

  return <div className='flex flex-row gap-2 items-center py-3 hover:text-blue-500 hover:underline scale-90 hover:scale-100'
    onClick={() => { click(props.text) }}>
    <h2 className="">{buttonText}</h2>
    <Copy size={24} />
  </div>
}

export default CopyButton;
