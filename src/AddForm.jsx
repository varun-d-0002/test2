import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Link } from 'react-router-dom';
import './AddForm.css';
import './Form.css'

const DraggableBlock = ({ id, name, type, index, moveBlock, isRequired, numButtons, buttonNames, options }) => {
  const [, drag] = useDrag({
    type: 'BLOCK',
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: 'BLOCK',
    hover(item, monitor) {
      if (!drag) {
        return;
      }
      if (item.index === index) {
        return;
      }
      moveBlock(item.index, index);
      item.index = index;
    },
  });

  const isFormname = type === 'formname';
  const isButton = type === 'button';
  const isCheckbox = type === 'checkbox';
  const isRadio = type === 'radio';
  const isDropdown = type === 'dropdown';

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`draggable-block ${isButton ? 'button-block' : ''} ${isFormname ? 'formname-block' : ''} ${isCheckbox ? 'checkbox-block' : ''} ${isRadio ? 'radio-block' : ''} ${isDropdown ? 'dropdown-block' : ''}`}
      style={{ border: isButton || isFormname ? 'none' : '' }}
    >
      {isFormname ? (
        <label className={`formname-label ${isRequired ? 'required-field' : ''}`}>{name}</label>
      ) : isButton ? (
        <div className="button-wrapper">
          <button>{name}</button>
        </div>
      ) : (
        <>
          <p>
            {name}
            {isRequired && <span className="required-star">*</span>}
          </p>
          {isCheckbox || isRadio ? (
            <div className={`option-row ${isCheckbox ? 'checkbox-row' : 'radio-row'}`}>
              {Array.from({ length: numButtons }, (_, buttonIndex) => (
                <div key={buttonIndex} className="option-item">
                  <input type={isCheckbox ? 'checkbox' : 'radio'} id={`button_${index}_${buttonIndex}`} name={`button_${index}`} />
                  <label htmlFor={`button_${index}_${buttonIndex}`}>{buttonNames[buttonIndex]}</label>
                </div>
              ))}
            </div>
          ) : isDropdown ? (
            <div>
              <select>
                {options.map((option, optionIndex) => (
                  <option key={optionIndex}>{option}</option>
                ))}
              </select>
            </div>
          ) : (
            <input type={type} placeholder={`Enter ${type} here`} required={isRequired} />
          )}
        </>
      )}
    </div>
  );
};

const AddForm = () => {
  const [blocks, setBlocks] = useState([]);
  const [blockName, setBlockName] = useState('');
  const [blockType, setBlockType] = useState('text');
  const [isBlockRequired, setIsBlockRequired] = useState(false);
  const [numButtons, setNumButtons] = useState(0);
  const [buttonNames, setButtonNames] = useState(Array(numButtons).fill(''));
  const [options, setOptions] = useState([]);
  const [newOption, setNewOption] = useState('');
  const [isAddButtonVisible, setIsAddButtonVisible] = useState(false);

  const addOption = () => {
    if (newOption.trim() !== '') {
      setOptions([...options, newOption]);
      setNewOption('');
    }
  };

  const removeOption = (index) => {
    const updatedOptions = [...options];
    updatedOptions.splice(index, 1);
    setOptions(updatedOptions);
  };

  const setNumButtonsAndUpdateNames = (newNumButtons) => {
    newNumButtons = parseInt(newNumButtons);
    if (isNaN(newNumButtons) || newNumButtons < 0) {
      alert('Please enter a valid positive integer for the number of buttons.');
      return;
    }

    const newButtonNames = Array(newNumButtons).fill('').map((_, index) => buttonNames[index] || '');
    setNumButtons(newNumButtons);
    setButtonNames(newButtonNames);
  };

  const addBlock = () => {
    if (
      blockName.trim() === '' ||
      blockType.trim() === '' ||
      (blockType !== 'formname' && blockType !== 'button' && isBlockRequired === '')
    ) {
      alert('Please fill in all the fields.');
      return;
    }

    const isButtonAlreadyAdded = blocks.some((block) => block.type === 'button');
    if (blockType === 'button' && isButtonAlreadyAdded) {
      alert('Only one button is allowed per form!');
      return;
    }

    if ((blockType === 'checkbox' || blockType === 'radio') && (numButtons <= 0 || buttonNames.some(name => name.trim() === ''))) {
      alert('Please fill in all the fields for checkbox or radio buttons.');
      return;
    }

    if (blockType === 'dropdown' && options.length === 0) {
      alert('Please add at least one option for the dropdown.');
      return;
    }

    const newBlock = {
      name: blockName,
      type: blockType,
      isRequired: isBlockRequired,
      numButtons: numButtons,
      buttonNames: buttonNames.slice(0, numButtons),
      options: options,
    };

    setBlocks([...blocks, newBlock]);

    // Update the state to make the "Add" button visible
    setIsAddButtonVisible(true);

    setBlockName('');
    setBlockType('text');
    setIsBlockRequired(false);
    setNumButtons(0);
    setButtonNames(Array(numButtons).fill(''));
    setOptions([]);
    setNewOption('');
  };

  const moveBlock = (dragIndex, hoverIndex) => {
    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(dragIndex, 1);

    if (draggedBlock.type === 'formname') {
      newBlocks.unshift(draggedBlock);
    } else {
      newBlocks.splice(hoverIndex, 0, draggedBlock);
    }

    setBlocks(newBlocks);
  };

  return (



    <DndProvider backend={HTML5Backend}>
      <div>
        <h1 style={{ color: 'rgb(61, 177, 249)' }}>Custom Survey</h1>
        <label>
          Name for the Field:
          <input type="text" value={blockName} onChange={(e) => setBlockName(e.target.value)} required />
        </label>

        <label>
          Input Type:
          <select value={blockType} onChange={(e) => setBlockType(e.target.value)} required>
            <option value=""></option>
            <option value="formname">Formname</option>
            <option value="text">Text</option>
            <option value="date">Date</option>
            <option value="number">Number</option>
            <option value="dropdown">Drop Down</option>
            <option value="radio">Radio Button</option>
            <option value="checkbox">Check Box</option>
            <option value="textarea">Text Area</option>
            <option value="button">Button</option>
            <option value="email">Email</option>
          </select>
        </label>

        {blockType === 'checkbox' || blockType === 'radio' ? (
          <div>
            <label>
              Number of Buttons:
              <input
                type="number"
                value={numButtons}
                onChange={(e) => setNumButtonsAndUpdateNames(parseInt(e.target.value))}
                required
              />
            </label>

            {[...Array(numButtons)].map((_, buttonIndex) => (
              <label key={buttonIndex}>
                Button {buttonIndex + 1} Name:
                <input
                  type="text"
                  value={buttonNames[buttonIndex]}
                  onChange={(e) => {
                    const newButtonNames = [...buttonNames];
                    newButtonNames[buttonIndex] = e.target.value;
                    setButtonNames(newButtonNames);
                  }}
                  required
                />
              </label>
            ))}
          </div>
        ) : blockType === 'dropdown' ? (
          <div>
            <label>
              Add Option Name:
              {options.map((option, optionIndex) => (
                <div key={optionIndex}>
                  <span>{option}</span>
                  <button
                    onClick={() => removeOption(optionIndex)}
                    style={{ marginRight: '30px', background: 'none', }}
                  >
                   ❌
                  </button>

                </div>
              ))}
              <div>
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="New Option"
                />
                <button onClick={addOption}>Add Option</button>
              </div>
            </label>
          </div>
        ) : null}

        {blockType !== 'formname' && blockType !== 'button' && blockType !== 'checkbox' && blockType !== 'radio' && blockType !== 'dropdown' && (
          <label>
            Is Required:
            <select value={isBlockRequired} onChange={(e) => setIsBlockRequired(e.target.value === 'true')}>
              <option value=""></option>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </label>
        )}

        <button onClick={addBlock}>Add Block</button>

        <div className="block-card">
          {blocks.map((block, index) => (
            <DraggableBlock
              key={index}
              id={index}
              index={index}
              name={block.name}
              type={block.type}
              moveBlock={moveBlock}
              isRequired={block.isRequired}
              numButtons={block.numButtons}
              buttonNames={block.buttonNames}
              options={block.options}
            />
          ))}
        </div>

        {isAddButtonVisible && (
          <Link to="/2"> {/* Use Link to navigate to the CLIENT side page */}
            <button
              style={{
                position: 'fixed',
                top: 10,
                right: 10,
                border: '1px solid #ddd',
                borderRadius: '5px',
                padding: '5px 10px',
                backgroundColor: 'transparent',
                color: 'rgb(61, 177, 249)',
              }}
            >
              Add +
            </button>
          </Link>
        )}
      </div>
    </DndProvider>
  );
};

export default AddForm;
