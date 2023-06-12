import * as React from 'react';
import { forwardRef, ForwardRefRenderFunction } from 'react';

export interface <%=exportName%>Props {
  title: string;
  content: string;
}
const <%=exportName%>Comp = (props: <%=exportName%>Props, ref: any) => {
  const { title, content, ...others } = props;

  return (
    <div ref={ref} className="<%=exportName%>Comp" {...others}>
      <h1>{title}</h1>
      {content || 'Hello <%=exportName%>Comp'}
    </div>
  );
};

const <%=exportName%> = forwardRef(<%=exportName%>Comp as ForwardRefRenderFunction<any, <%=exportName%>Props>);
<%=exportName%>.displayName = '<%=exportName%>';

export default <%=exportName%>;
